const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files and set EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
  res.render('index2');
});

// Store client locations
const clients = {};

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Broadcast current locations to all clients
  io.emit('allLocations', clients);

  // Update location of a client
  socket.on('locationUpdate', (location) => {
    // Save the client's location
    clients[socket.id] = location;
    console.log(`Location from ${socket.id}: Latitude = ${location.latitude}, Longitude = ${location.longitude}`);

    // Broadcast updated locations to all clients
    io.emit('allLocations', clients);
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    delete clients[socket.id]; // Remove client from the list
    io.emit('allLocations', clients); // Notify other clients
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
