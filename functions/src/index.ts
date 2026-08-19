import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";

import {
  onRequest,
  Request,
} from "firebase-functions/v2/https";

import {Response} from "express";

import {
  createPayment,
} from "./webpay/create-payment";

import {
  commitPayment,
} from "./webpay/commit-payment";

import {
  cancelPayment,
} from "./webpay/cancel-payment";

import {
  appBaseUrl,
} from "./config/app";

initializeApp();

const ALLOWED_ORIGINS = new Set([
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:19006",
  "http://localhost:3000",
  // Agregar aquí el dominio de producción (Vercel) cuando exista.
]);

function setCors(
  req: Request,
  res: Response,
) {
  const origin =
    req.headers.origin;

  if (
    typeof origin === "string" &&
    ALLOWED_ORIGINS.has(origin)
  ) {
    res.set(
      "Access-Control-Allow-Origin",
      origin,
    );
  }

  res.set(
    "Vary",
    "Origin",
  );

  res.set(
    "Access-Control-Allow-Methods",
    "POST,OPTIONS",
  );

  res.set(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization",
  );
}

async function requireUser(
  req: Request,
) {
  const authorization =
    req.headers.authorization;

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  const idToken =
    authorization.substring(
      "Bearer ".length,
    );

  return getAuth()
    .verifyIdToken(idToken);
}

function mapError(
  error: unknown,
) {
  if (
    error instanceof Error
  ) {
    switch (
      error.message
    ) {
      case "UNAUTHORIZED":
        return {
          status: 401,
          message: "Debes iniciar sesión para realizar esta operación.",
        };

      case "PAGO_PENDIENTE":
        return {
          status: 409,
          message: "Ya tienes un pago pendiente. Inténtalo en unos instantes.",
        };
    }
  }

  return {
    status: 500,
    message: "No se pudo completar la operación. Inténtalo de nuevo.",
  };
}

function firstString(
  value: unknown,
) {
  if (
    Array.isArray(value)
  ) {
    return typeof value[0] === "string"
      ? value[0]
      : "";
  }

  return typeof value === "string"
    ? value
    : "";
}

function resultRedirectUrl(
  paymentId: string,
  result: string,
) {
  const base =
    appBaseUrl();

  const separator =
    base.includes("?")
      ? "&"
      : "?";

  const params = [
    paymentId
      ? `paymentId=${encodeURIComponent(paymentId)}`
      : "",
    `result=${result}`,
  ]
    .filter(Boolean)
    .join("&");

  return `${base}/payment-result${separator}${params}`;
}

export const createWebpayTransaction =
  onRequest(
    {
      region: "southamerica-west1",
    },
    async (req, res) => {
      setCors(req, res);

      if (
        req.method === "OPTIONS"
      ) {
        res.status(204).send("");
        return;
      }

      if (
        req.method !== "POST"
      ) {
        res.status(405).json({
          error:
            "Método no permitido.",
        });

        return;
      }

      try {
        const decodedToken =
          await requireUser(req);

        const {
          email,
          name,
          returnUrl,
        } = req.body ?? {};

        if (
          typeof email !== "string" ||
          typeof name !== "string" ||
          typeof returnUrl !== "string" ||
          !email.trim() ||
          !name.trim() ||
          !returnUrl.trim()
        ) {
          res.status(400).json({
            error:
              "Faltan datos para crear el pago.",
          });

          return;
        }

        const result =
          await createPayment(
            {
              uid: decodedToken.uid,
              email,
              name,
            },
            returnUrl,
          );

        res
          .status(200)
          .json(result);
      } catch (error) {
        console.error(
          "createWebpayTransaction:",
          error,
        );

        const mapped =
          mapError(
            error,
          );

        res
          .status(
            mapped.status,
          )
          .json({
            error:
              mapped.message,
          });
      }
    },
  );

// Endpoint de retorno de Transbank. Se llama desde el navegador después de
// la visita a Webpay, por lo tanto NO exige Firebase ID Token.
// Recibe token_ws (éxito) o TBK_TOKEN/TBK_ORDEN_COMPRA/TBK_ID_SESION (aborto).
export const webpayReturn =
  onRequest(
    {
      region: "southamerica-west1",
    },
    async (req, res) => {
      if (
        req.method !== "GET" &&
        req.method !== "POST"
      ) {
        res.status(405).send("");
        return;
      }

      const query =
        req.query ?? {};

      const body =
        (req.body ?? {}) as
          Record<string, unknown>;

      const paymentId =
        firstString(query.paymentId) ||
        firstString(body.paymentId);

      const tokenWs =
        firstString(query.token_ws) ||
        firstString(body.token_ws);

      const tbkToken =
        firstString(query.TBK_TOKEN) ||
        firstString(body.TBK_TOKEN);

      const tbkOrden =
        firstString(query.TBK_ORDEN_COMPRA) ||
        firstString(body.TBK_ORDEN_COMPRA);

      const tbkSesion =
        firstString(query.TBK_ID_SESION) ||
        firstString(body.TBK_ID_SESION);

      if (!paymentId) {
        res.redirect(
          302,
          resultRedirectUrl(
            "",
            "failed",
          ),
        );

        return;
      }

      if (
        tbkToken ||
        tbkOrden ||
        tbkSesion
      ) {
        try {
          await cancelPayment(paymentId);
        } catch (error) {
          console.error(
            "webpayReturn cancel:",
            error,
          );
        }

        res.redirect(
          302,
          resultRedirectUrl(
            paymentId,
            "cancelled",
          ),
        );

        return;
      }

      if (!tokenWs) {
        res.redirect(
          302,
          resultRedirectUrl(
            paymentId,
            "failed",
          ),
        );

        return;
      }

      try {
        const result =
          await commitPayment(
            paymentId,
            tokenWs,
          );

        res.redirect(
          302,
          resultRedirectUrl(
            paymentId,
            result.authorized
              ? "success"
              : "failed",
          ),
        );
      } catch (error) {
        console.error(
          "webpayReturn commit:",
          error,
        );

        res.redirect(
          302,
          resultRedirectUrl(
            paymentId,
            "failed",
          ),
        );
      }
    },
  );