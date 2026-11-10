import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  CLIENT_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  verifySessionToken,
  type SessionUser,
} from "@/lib/jwt";

async function setCookie(name: string, token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

async function clearCookie(name: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(name);
}

async function getSession(name: string): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(name)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export function setAdminCookie(token: string): Promise<void> {
  return setCookie(ADMIN_COOKIE_NAME, token);
}

export function setClientCookie(token: string): Promise<void> {
  return setCookie(CLIENT_COOKIE_NAME, token);
}

export function clearAdminCookie(): Promise<void> {
  return clearCookie(ADMIN_COOKIE_NAME);
}

export function clearClientCookie(): Promise<void> {
  return clearCookie(CLIENT_COOKIE_NAME);
}

export function getAdminSession(): Promise<SessionUser | null> {
  return getSession(ADMIN_COOKIE_NAME);
}

export function getClientSession(): Promise<SessionUser | null> {
  return getSession(CLIENT_COOKIE_NAME);
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const session = await getAdminSession();

  if (
    !session ||
    (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")
  ) {
    return null;
  }

  return session;
}

export async function requireSuperAdmin(): Promise<SessionUser | null> {
  const session = await getAdminSession();

  if (!session || session.role !== "SUPER_ADMIN") {
    return null;
  }

  return session;
}

export async function requireUser(): Promise<SessionUser | null> {
  const session = await getClientSession();

  if (!session || session.role !== "USER") {
    return null;
  }

  return session;
}
