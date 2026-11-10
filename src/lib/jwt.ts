import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE_NAME = "ps_admin_session";
export const CLIENT_COOKIE_NAME = "ps_client_session";

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type SessionRole = "ADMIN" | "SUPER_ADMIN" | "USER";

export type SessionUser = {
  id: string;
  login: string;
  role: SessionRole;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({ login: user.login, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_TTL_SECONDS)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const { sub: id, login, role } = payload;

    if (
      !id ||
      typeof login !== "string" ||
      (role !== "ADMIN" && role !== "USER" && role !== "SUPER_ADMIN")
    ) {
      return null;
    }

    return { id, login, role };
  } catch {
    return null;
  }
}
