import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

const tokenSecret = process.env.ACCESS_TOKEN_SECRET;

export default function authTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "User not logged in.",
    });
  }

  if (!tokenSecret) {
    throw new Error("JWT secret is not defined.");
  }

  jwt.verify(token, tokenSecret, (err, user) => {
    if (err || !user || typeof user === "string") {
      return res.status(403).json({
        message: "Access token expired.",
      });
    }
    req.user = user;
    next();
  });
}
