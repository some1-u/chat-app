import "dotenv/config";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { dbinit } from "./config/db.js";
import cors from "cors";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
const app = express();
dbinit();
app.use(cors({
  origin: ["http://localhost:5173", "https://chat.msamanyu.me"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://chat.msamanyu.me"],
    methods: ["GET", "POST"],
  },
});
app.use("/auth", authRouter);
app.use("/user", userRouter);
const userSockets = {};

io.on("connection", (socket) => {
  console.log("User connectted");

  socket.on("register-user", (userId) => {
    userSockets[userId] = socket.id;
    console.log("User registered: " + userId);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });

  socket.on("leave-room", (room) => {
    socket.leave(room);
    console.log("User left room: " + room);
  });

  socket.on("private-message", (room, msg, id) => {
    socket.to(room).emit("recieve-private-message", room, msg, id);
    console.log("private message to " + room + ": " + msg);
  });

  socket.on("disconnect", () => {
    for (const [userId, sockId] of Object.entries(userSockets)) {
      if (sockId === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
    console.log("user disconnected");
  });
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
