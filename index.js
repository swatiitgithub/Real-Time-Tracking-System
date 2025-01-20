const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "https://cool-daffodil-899754.netlify.app", // Your frontend URL
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Route to fetch tower data
app.get("/towers", async (req, res) => {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Missing latitude or longitude" });
  }

  try {
    const bbox = [
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(latitude) + 0.5,
      parseFloat(longitude) + 0.5,
    ];
    const response = await axios.get(
      `https://www.opencellid.org/cell/getInArea?key=pk.de130c4c2ee76f8ba1e290ae8834ca0e&BBOX=${bbox.join(
        ","
      )}&mcc=260&mnc=2&lac=45070`
    );
    const data = response.data;
    res.json(data); // Send tower data to the client
  } catch (error) {
    console.error("Error fetching tower data:", error.message);
    res.status(500).json({ error: "Unable to fetch tower data" });
  }
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Determine client type (web or mobile)
  const clientType = socket.handshake.query.clientType || "web";
  console.log(`Client type: ${clientType}`);
  socket.join(clientType); // Add client to specific room (web or mobile)

  // Handle location updates from clients
  socket.on("client_location_send", (data) => {
    console.log(`Received location from ${socket.id} (${clientType}):`, data);

    if (data.latitude && data.longitude) {
      // Emit location data to the respective room
      io.to(clientType).emit("update-users", { id: socket.id, ...data });
    } else {
      console.error("Invalid location data received:", data);
    }
  });

  // Handle client disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    io.to(clientType).emit("user-disconnected", socket.id);
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("Socket.IO Server is running.");
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
