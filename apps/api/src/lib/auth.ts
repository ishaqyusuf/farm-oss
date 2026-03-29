import type { AuthUser } from "@farm-oss/auth";
import { SignJWT, jwtVerify } from "jose";

const ALG = "HS256";
const EXPIRY = "30d";

function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET ?? "farm-oss-dev-secret-change-in-production";
  return new TextEncoder().encode(raw);
}

/**
 * Issue a signed JWT for an authenticated user.
 * Token expires in 30 days (suitable for long-lived mobile sessions).
 */
export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
  })
    .setProtectedHeader({ alg: ALG })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

/**
 * Verify a JWT and return the decoded AuthUser, or null if invalid/expired.
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: payload["id"] as string,
      userId: payload["userId"] as string,
      email: payload["email"] as string,
      name: payload["name"] as string,
      role: payload["role"] as AuthUser["role"],
      tenantId: payload["tenantId"] as string,
    };
  } catch {
    return null;
  }
}

/**
 * Hash a plaintext password using Bun's built-in argon2id.
 * Only call from server-side code (seed, sign-up flows).
 */
export async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: "argon2id" });
}

/**
 * Verify a plaintext password against a stored hash.
 * Algorithm is auto-detected from the hash prefix.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return Bun.password.verify(password, hash);
}
