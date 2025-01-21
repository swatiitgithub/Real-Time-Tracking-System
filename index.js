const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*", // सभी डोमेन से अनुरोध स्वीकार करें (डेवलपमेंट के लिए)
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json()); // JSON डेटा को पार्स करने के लिए

// Users का डेटा स्टोर करने के लिए
let users = {};

// Socket.IO कनेक्शन सेटअप
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Client से लोकेशन प्राप्त करना
  socket.on("client_location_send", (data) => {
    const { latitude, longitude, networkDetails } = data;

    if (latitude && longitude && networkDetails) {
      // User का डेटा स्टोर करें
      users[socket.id] = { latitude, longitude, networkDetails };
      console.log(`User ${socket.id} Location Updated:`, users[socket.id]);

      // सभी क्लाइंट्स को अपडेट भेजें
      io.emit("update-users", users);
    } else {
      console.error("Invalid data received from client:", data);
    }
  });

  // डिसकनेक्ट इवेंट
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // User का डेटा हटाएं
    delete users[socket.id];

    // सभी क्लाइंट्स को अपडेट भेजें
    io.emit("update-users", users);
  });
});

// GET API: उपयोगकर्ताओं का रीयल-टाइम डेटा
app.get("/users", (req, res) => {
  res.json(users);
});

// Default Route
app.get("/", (req, res) => {
  res.send("Real-Time User Tracking Server is running.");
});

// Server शुरू करें
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
