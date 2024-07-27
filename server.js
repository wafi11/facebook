import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer, Socket } from "socket.io";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
import crypto from "crypto";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handler(req, res);
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
        const savedMessages = await prisma.directMessage.create({
          data: {
            content,
            senderId,
            receiverId,
          },
          include: { receiver: true, sender: true },
        });

        const combinedData = [senderId, receiverId].sort().join("");
        const hash = crypto
          .createHash("sha256")
          .update(combinedData)
          .digest("hex");

        const uniqueKey = `chat:${hash}:message:update`;

        io.emit(uniqueKey, { ...savedMessages });
        


      } catch (error) {
        console.log("Failed to Send Error ", error);
        socket.emit("error", "message failed tosend");
      }
    });
  });
  httpServer.once("error", (err) => {
    console.error("HTTP server error:", err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
  });
});
