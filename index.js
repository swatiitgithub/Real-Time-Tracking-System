const express = require("express"); // Express for creating API
const http = require("http"); // HTTP server
const socketio = require("socket.io"); // WebSocket connections
const cors = require("cors"); // CORS policy handling

const app = express(); // Create Express app
const server = http.createServer(app); // Create HTTP server
const io = socketio(server, {
  cors: {
    origin: "*", // Allow all frontends (limit if needed)
    methods: ["GET", "POST"], // Allow only GET and POST methods
  },
});

app.use(cors()); // Enable CORS

// WebSocket connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Receive location data from client
  socket.on("client_location_send", (data) => {
    console.log(`Location received from ${socket.id}:`, data);

    // Broadcast location data to all connected clients
    if (data.latitude && data.longitude) {
      io.emit("update-users", { id: socket.id, ...data });
    } else {
      console.error("Invalid location data:", data);
    }
  });

  // Handle client disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    io.emit("user-disconnected", socket.id); // Notify all clients
  });
});

// API endpoint for testing
app.get("/", (req, res) => {
  res.send("Socket.IO server is running.");
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
