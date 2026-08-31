import "temporal-polyfill/full/global";
import express from "express";
import authRouter from "./routes/auth.ts";
import errorHandler from "./middleware/errorHandler.ts";
import messagesRouter from "./routes/messages.ts";

const PORT = 8000;
const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/messages", messagesRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
