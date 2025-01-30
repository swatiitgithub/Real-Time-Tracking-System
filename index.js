const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const users = {}; // Store users data
const admins = {}; // Store admins data

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  const userId = uuidv4();
  console.log(`Assigned userId for ${socket.id}:`, userId);

  // Listen for the client sending location data
  socket.on("client_location_send", (data) => {
    console.log(`Received location data from ${socket.id}:`, data);
    const { latitude, longitude, userType } = data;

    // If latitude and longitude are available, store the data
    if (latitude && longitude) {
      if (userType === "admin") {
        admins[userId] = { latitude, longitude };
      } else {
        users[userId] = { latitude, longitude };
      }
      console.log("Updated users:", users);
      console.log("Updated admins:", admins);

      // Broadcast updated users to all admins
      io.emit("update-users", { users });
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[userId];
    delete admins[userId];
    console.log("Updated users after disconnect:", users);
    console.log("Updated admins after disconnect:", admins);

    // Broadcast the updated users after a disconnect
    io.emit("update-users", { users });
  });
});

app.get("/", (req, res) => {
  res.send("Socket.IO Server is running.");
});

// Set the server port
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});