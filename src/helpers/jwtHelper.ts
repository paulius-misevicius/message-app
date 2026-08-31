import jwt from "jsonwebtoken";

const tokenSecret = process.env.ACCESS_TOKEN_SECRET;

export function signToken(userId: number) {
  if (!tokenSecret) {
    throw new Error("JWT secret is not defined.");
  }
  return jwt.sign(
    {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
    },
    tokenSecret,
  );
}
