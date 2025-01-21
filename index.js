const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("client_location_send", (data) => {
    console.log(`Location received from ${socket.id}:`, data);

    if (data.latitude && data.longitude) {
      io.emit("update-users", { id: socket.id, ...data });
    } else {
      console.error("Invalid location data:", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    io.emit("user-disconnected", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Socket.IO server is running.");
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
