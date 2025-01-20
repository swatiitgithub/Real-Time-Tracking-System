const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "https://cool-daffodil-899754.netlify.app", // Aapka frontend URL
    methods: ["GET", "POST"],
  },
});

app.use(cors());

// Mobile aur Web clients ke liye alag arrays
let mobileClients = [];
let webClients = [];

// Towers data API
app.get("/towers", async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.opencellid.org/cell/getInArea?key=pk.de130c4c2ee76f8ba1e290ae8834ca0e&BBOX=52.0,21.0,52.5,21.5&mcc=260&mnc=2&lac=45070"
    );
    const data = response.data;
    res.json(data); // Data frontend par bhejenge
  } catch (error) {
    console.error("Error fetching tower data:", error);
    res.status(500).json({ error: "Unable to fetch tower data" });
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Client type set karna: web ya mobile
  socket.on("client-type", (type) => {
    if (type === "mobile") {
      mobileClients.push(socket.id);
      console.log("Mobile client connected:", socket.id);
    } else if (type === "web") {
      webClients.push(socket.id);
      console.log("Web client connected:", socket.id);
    } else {
      console.warn("Unknown client type:", type);
    }
  });

  // Location receive karna
  socket.on("client_location_send", (data) => {
    console.log(`Received location from ${socket.id}:`, data);
    if (data.latitude && data.longitude) {
      // Mobile clients ke liye broadcast
      if (mobileClients.includes(socket.id)) {
        mobileClients.forEach((id) => {
          io.to(id).emit("update-users", { id: socket.id, ...data });
        });
      }

      // Web clients ke liye broadcast
      if (webClients.includes(socket.id)) {
        webClients.forEach((id) => {
          io.to(id).emit("update-web", { id: socket.id, ...data });
        });
      }
    } else {
      console.error("Invalid location data received", data);
    }
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    mobileClients = mobileClients.filter((id) => id !== socket.id);
    webClients = webClients.filter((id) => id !== socket.id);
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
