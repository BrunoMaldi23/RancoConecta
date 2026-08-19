// Envía el correo de bienvenida a un comercio recién pagado con su
// contraseña temporal y el enlace para empezar en Ranco Conecta.
import {
  appBaseUrl,
} from "../config/app";

import {
  emailFrom,
  getResend,
} from "../config/email";

type TemporaryPasswordEmailInput = {
  name: string;
  email: string;
  temporaryPassword: string;
};

export async function sendTemporaryPasswordEmail(
  input: TemporaryPasswordEmailInput,
) {
  const resend = getResend();

  const from =
    emailFrom();

  if (!resend || !from) {
    throw new Error(
      "El envío de correos no está configurado (RESEND_API_KEY / EMAIL_FROM).",
    );
  }

  const appUrl =
    appBaseUrl();

  const loginUrl =
    `${appUrl}/`;

  const subject =
    "Tu cuenta Ranco Conecta está lista";

  const html =
    `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
</head>
<body style="margin:0;padding:0;background-color:#EAF3F0;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EAF3F0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#FFFFFF;border-radius:16px;border:1px solid #D5E0DA;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <p style="margin:0;color:#2F7353;font-size:11px;font-weight:bold;letter-spacing:1.5px;">RANCO CONECTA</p>
              <h1 style="margin:8px 0 0 0;color:#245F47;font-size:22px;line-height:28px;">¡Bienvenido, ${escHtml(input.name)}!</h1>
              <p style="margin:12px 0 0 0;color:#687970;font-size:14px;line-height:21px;">
                Tu membresía ya está activa y tu cuenta fue creada en Ranco Conecta.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F2FAF6;border:1px solid #D2E4DA;border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0;color:#718078;font-size:12px;line-height:18px;">Para ingresar a la app usa esta contraseña temporal junto a tu correo <strong>${escHtml(input.email)}</strong>.</p>
                    <p style="margin:14px 0 0 0;padding:12px 14px;background-color:#FFFFFF;border:1px dashed #2F7353;border-radius:8px;font-size:16px;font-weight:bold;color:#1D5F4A;text-align:center;letter-spacing:1px;">${escHtml(input.temporaryPassword)}</p>
                    <p style="margin:14px 0 0 0;color:#718078;font-size:12px;line-height:18px;">Al entrar se te pedirá crear una contraseña propia.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px 32px;">
              <a href="${escAttr(loginUrl)}" style="display:inline-block;padding:13px 26px;background-color:#2F7353;color:#FFFFFF;text-decoration:none;border-radius:12px;font-size:14px;font-weight:bold;">Entrar a mi cuenta</a>
              <p style="margin:16px 0 0 0;color:#9AA59F;font-size:11px;line-height:17px;">Si no esperabas este correo, puedes ignorarlo.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const {
    data,
    error,
  } = await resend.emails.send({
    from,
    to: input.email,
    subject,
    html,
  });

  return {
    id: data?.id ?? null,
    error: error as unknown ?? null,
  };
}

function escHtml(
  value: string,
) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escAttr(
  value: string,
) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}