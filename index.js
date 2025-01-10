const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Socket.IO setup with updated CORS
const io = socketio(server, {
  cors: {
    origin: "https://cool-daffodil-899754.netlify.app/", // Netlify URL
    methods: ["GET", "POST"], // Allow GET and POST requests
  },
});

// Middleware to handle CORS for HTTP requests
app.use(
  cors({
    origin: "https://cool-daffodil-899754.netlify.app/", // Netlify URL
    methods: ["GET", "POST"], // Allow GET and POST requests
  })
);

// Socket.IO connection event
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for location updates from the client
  socket.on("client_location_send", (data) => {
    console.log(`Received location from ${socket.id}:`, data);
    io.emit("update-users", { id: socket.id, ...data }); // Broadcast location to all users
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    io.emit("user-disconnected", socket.id); // Notify others about disconnection
  });
});

// Root route for the server
app.get("/", (req, res) => {
  res.send("Socket.IO Server is running.");
});

// Start the server
const PORT = 4000; // Your backend server port
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
