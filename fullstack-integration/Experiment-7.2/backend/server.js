// backend/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Simple middleware to log requests with a timestamp
const logMiddleware = (socket, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] New user connected: ${socket.id}`);
    next();
};
io.use(logMiddleware);


io.on("connection", (socket) => {
  socket.on("send_message", (data) => {
    // Add timestamp to the message data on the server
    const messageDataWithTimestamp = {
      ...data,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }), // e.g., 11:25:18
    };

    // Log the message with timestamp in the terminal
    console.log(`[${messageDataWithTimestamp.timestamp}] Message from '${data.name}': ${data.message}`);

    // Broadcast the message with timestamp to all clients
    io.emit("receive_message", messageDataWithTimestamp);
  });

  socket.on("disconnect", () => {
    console.log(`[${new Date().toLocaleTimeString()}] User disconnected: ${socket.id}`);
  });
});

const PORT = 5001;
server.listen(PORT, () => console.log(`Chat Server running on port ${PORT}`));