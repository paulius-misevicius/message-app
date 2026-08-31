import { Router } from "express";
import authTokenHandler from "../middleware/authTokenHandler.ts";
import { checkInputType } from "../helpers/generalHelpers.ts";
import { db } from "../../prisma/db.ts";

const messagesRouter = Router();

messagesRouter.get("/", authTokenHandler, async (req, res) => {
  const user = req.user;

  console.log(user);
});

messagesRouter.post("/", authTokenHandler, async (req, res) => {
  const { body, recipientUserId } = req.body;

  const checkType = checkInputType({ body, recipientUserId });
  if (checkType) return res.status(400).json({ message: checkType });

  if (!body || !recipientUserId) {
    return res.status(400).json({
      message: "Missing required fields.",
    });
  }

  await db.orm.public.Message.create({
    body,
    recipientUserId,
    senderUserId: Number(req.user!.sub),
  });

  return res.status(201).json({
    message: "Message successfully created!",
  });
});

export default messagesRouter;
