import "dotenv/config";
import { Router } from "express";
import validator from "validator";
import {
  checkPasswordRegex,
  checkUsernameRegex,
  checkInputType,
} from "../helpers/generalHelpers.ts";
import { db } from "../../prisma/db.ts";
import bcrypt from "bcryptjs";
import { signToken } from "../helpers/jwtHelper.ts";

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  let { username, email, password } = req.body;

  const checkType = checkInputType({ username, email, password });
  if (checkType) return res.status(400).json({ message: checkType });

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Missing required fields.",
    });
  }

  username = username.trim();
  email = email.trim().toLowerCase();

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      message: "Invalid email format.",
    });
  }

  const usernameError = checkUsernameRegex(username);
  if (usernameError) return res.status(400).json({ message: usernameError });

  const passwordError = checkPasswordRegex(password);
  if (passwordError) return res.status(400).json({ message: passwordError });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await db.orm.public.User.select("id").create({
      email,
      username,
      passwordHash: hashedPassword,
    });

    const accessToken = signToken(user.id);

    return res.status(201).json({
      accessToken,
      message: "Your account has been created!",
    });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "sqlState" in err &&
      "constraint" in err &&
      err.sqlState === "23505"
    ) {
      if (err.constraint === "user_username_key") {
        return res.status(409).json({
          message: "Username already taken.",
        });
      }

      if (err.constraint === "user_email_key") {
        return res.status(409).json({
          message: "Email already taken.",
        });
      }

      return res.status(409).json({
        message: "Username or email already taken.",
      });
    }

    throw err;
  }
});

authRouter.post("/login", async (req, res) => {
  let { username, password } = req.body;

  const checkType = checkInputType({ username, password });
  if (checkType) return res.status(400).json({ message: checkType });

  if (!username || !password) {
    return res.status(400).json({
      message: "Missing required fields.",
    });
  }

  username = username.trim();

  const user = await db.orm.public.User.select("id", "passwordHash")
    .where({ username })
    .first();

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials.",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid credentials.",
    });
  }

  const accessToken = signToken(user.id);

  return res.json({
    accessToken,
    message: "Logged in successfully!",
  });
});

export default authRouter;
