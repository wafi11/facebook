import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer, Socket } from "socket.io";
import crypto from "crypto";
import pkg from 'pg';
const { Pool } = pkg;

const dev = process.env.NODE_ENV === "production";
const port = process.env.PORT || 3000;
const localhost = process.env.LOCALHOST;
const app = next({ dev, localhost, port });
const handler = app.getRequestHandler();
const databaseUrl = process.env.DATABASE_URL;

// Buat koneksi pool PostgreSQL
const pool = new Pool({
  connectionString: databaseUrl,
});

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
        // Gunakan pool.query untuk menjalankan query SQL
        const result = await pool.query(
          'INSERT INTO direct_messages (content, sender_id, receiver_id) VALUES ($1, $2, $3) RETURNING *',
          [content, senderId, receiverId]
        );

        const savedMessage = result.rows[0];

        // Ambil informasi sender dan receiver
        const senderResult = await pool.query('SELECT * FROM users WHERE id = $1', [senderId]);
        const receiverResult = await pool.query('SELECT * FROM users WHERE id = $1', [receiverId]);

        const savedMessages = {
          ...savedMessage,
          sender: senderResult.rows[0],
          receiver: receiverResult.rows[0]
        };

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

  httpServer.once("error", (err) => {
    console.error("HTTP server error:", err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`Server is running at ${localhost}:${port}`);
  });
});