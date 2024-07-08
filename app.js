const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io to the server
const io = socketio(server);

// Set up EJS as the view engine
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Handle socket connections
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Listen for location updates from clients
    socket.on("end-location", (data) => {
        // Broadcast the received location to all clients
        io.emit("receive-location", { id: socket.id, ...data });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        io.emit("user-disconnected", socket.id);
    });
});

// Define a route for the home page
app.get('/', (req, res) => {
    res.render("index");
});

// Start the server
server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
