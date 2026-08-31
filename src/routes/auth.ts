import { Router } from "express";
import validator from "validator";
import {
  checkPasswordRegex,
  checkUsernameRegex,
} from "../helpers/regexChecker.ts";
import { db } from "../../prisma/db.ts";
import bcrypt from "bcryptjs";

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  let { username, email, password } = req.body;

  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({
      message: "Invalid inputs.",
    });
  }

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
    await db.orm.public.User.create({
      email,
      username,
      password_hash: hashedPassword,
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

  return res.status(201).json({
    message: "Your account has been created!",
  });
});

export default authRouter;
