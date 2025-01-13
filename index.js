const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "https://cool-daffodil-899754.netlify.app", // Update to your frontend URL
    methods: ["GET", "POST"],
  },
});

app.use(cors());

// Route to fetch tower data
app.get("/towers", async (req, res) => {
  try {
    const response = await axios.get('https://www.opencellid.org/cell/getInArea?key=pk.de130c4c2ee76f8ba1e290ae8834ca0e&BBOX=52.0,21.0,52.5,21.5&mcc=260&mnc=2&lac=45070');
    const data = response.data;
    res.json(data); // Send tower data to the client
  } catch (error) {
    console.error("Error fetching tower data:", error);
    res.status(500).json({ error: "Unable to fetch tower data" });
  }
});

// Socket.IO connection for real-time location sharing
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("client_location_send", (data) => {
    console.log(`Received location from ${socket.id}:`, data);
    if (data.latitude && data.longitude) {
      io.emit("update-users", { id: socket.id, ...data });
    } else {
      console.error("Invalid location data received", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    io.emit("user-disconnected", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Socket.IO Server is running.");
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
