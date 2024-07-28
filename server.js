import { createServer } from "node:http";
import next from "next";
import {parse}  from "url"
import { Server as SocketIOServer } from "socket.io";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
const dev = process.env.NODE_ENV !== "production";
const prisma = new PrismaClient()
const port = process.env.PORT
const app = next({ dev});
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handler(req, res, parsedUrl);
  });


  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("sendMessage", async (message) => {
      console.log(message);
      const { content, receiverId, senderId } = message;
      if (!receiverId || !senderId) {
        throw new Error("Internal Server Error");
      }

      try {
          await prisma.directMessage.create({
            data : {
              content,
              receiverId,
              senderId
            }
          })

        const combinedData = [senderId, receiverId].sort().join("");
        const hash = crypto
          .createHash("sha256")
          .update(combinedData)
          .digest("hex");

        const uniqueKey = `chat:${hash}:message:update`;
        io.emit(uniqueKey, { ...savedMessages });
      } catch (error) {
        console.log("Failed to Send Error ", error);
        socket.emit("error", "message failed to send");
      }
    });
  });

  httpServer.once("error", async(err) => {
    await prisma.$disconnect()
    console.error("HTTP server error:", err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`Server is running at ${localhost}`);
  });
});