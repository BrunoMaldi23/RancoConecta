// Tras un pago de membresía exitoso, dota al comercio de una contraseña
// temporal (el comercio se registró con email-link, sin clave propia) y le
// envía el correo de bienvenida. Marca users/{uid}.mustChangePassword para
// que la app fuerce el cambio de clave en el siguiente ingreso.
import {
  randomInt,
} from "node:crypto";

import {
  getAuth,
} from "firebase-admin/auth";

import {
  getFirestore,
  Timestamp,
} from "firebase-admin/firestore";

import {
  sendTemporaryPasswordEmail,
} from "../email/send-temporary-password";

const CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function generateTemporaryPassword(
  length = 10,
) {
  let password = "";

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    password += CHARS.charAt(
      randomInt(CHARS.length),
    );
  }

  return password;
}

export async function provisionMemberAccount(
  userId: string,
  email: string,
  name: string,
) {
  const temporaryPassword =
    generateTemporaryPassword();

  const auth =
    getAuth();

  const db =
    getFirestore();

  // Define la contraseña temporal en el usuario de Authentication.
  await auth.updateUser(
    userId,
    {
      password: temporaryPassword,
    },
  );

  // Marca el perfil para que la app fuerce el cambio de clave.
  await db
    .collection("users")
    .doc(userId)
    .update({
      mustChangePassword: true,
      updatedAt: Timestamp.now(),
    });

  // Envía el correo con la contraseña temporal y el enlace de ingreso.
  await sendTemporaryPasswordEmail({
    name,
    email,
    temporaryPassword,
  });

  return {
    temporaryPassword,
  };
}