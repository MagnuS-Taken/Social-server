const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");

const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/posts");

const app = express();

require("dotenv").config();

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

mongoose
  .connect(process.env.MONGO_URL, options)
  .then(() => console.log("Connected to DB ......"))
  .catch((err) => console.log(err));

// middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);

app.listen(3001, () => {
  console.log("Server Running ..........");
});
