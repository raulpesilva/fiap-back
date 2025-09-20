import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { PublicUser } from 'src/@types/db';

export const secretKey = process.env.JWT_SECRET;
export const JWTSecretEncoded = new TextEncoder().encode(secretKey);

export async function createToken({ expiresAt, user }: { user: PublicUser | JWTPayload; expiresAt: Date }) {
  return new SignJWT(user as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(JWTSecretEncoded);
}

export async function verifyToken(input: string | undefined = '') {
  try {
    const { payload } = await jwtVerify<PublicUser>(input, JWTSecretEncoded, { algorithms: ['HS256'] });
    return payload;
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
    return null;
  }
}
