import io from "socket.io-client";

const socketUrl = "http://localhost:3000";

export default function Sockets(id: string) {
  const options = {
    reconnectionAttempts: Infinity,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionMaxDelay: 5000,
    query: { userId: id },
  };

  const socket = io(socketUrl, options);

  socket.on("connect", () => {
    console.log("Connected to server");
  });

  socket.on("connect_error", (error) => {
    console.log("Connection error:", error);
  });

  return socket;
}
