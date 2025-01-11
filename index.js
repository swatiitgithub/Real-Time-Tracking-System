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

const GOOGLE_API_KEY = "AIzaSyDxp8MamOh_0gBNHBq4m3bgCIgksc4YYgQ"; // Replace with your Google API key

// Endpoint to fetch nearby towers based on user location
const fetchNearbyTowers = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=10000&type=mobile_tower&key=${GOOGLE_API_KEY}`
    );
    return response.data.results.map((tower) => ({
      name: tower.name,
      latitude: tower.geometry.location.lat,
      longitude: tower.geometry.location.lng,
    }));
  } catch (error) {
    console.error("Error fetching towers:", error);
    return [];
  }
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("client_location_send", async (data) => {
    console.log(`Received location from ${socket.id}:`, data);
    const towers = await fetchNearbyTowers(data.latitude, data.longitude);
    io.emit("update-users", { id: socket.id, ...data, towers });
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
