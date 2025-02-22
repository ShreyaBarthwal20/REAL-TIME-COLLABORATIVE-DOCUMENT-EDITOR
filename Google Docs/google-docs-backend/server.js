require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Document Model
const Document = require("./models/document");

// Default Route (Prevents "Cannot GET /" error)
app.get("/", (req, res) => {
  res.send("✅ Backend is running! 🚀");
});

// Socket.io for Real-time Collaboration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 New Client Connected:", socket.id);

  socket.on("get-document", async (docId) => {
    const document =
      (await Document.findById(docId)) || new Document({ _id: docId, content: "" });

    socket.join(docId);
    socket.emit("load-document", document.content);

    socket.on("send-changes", (delta) => {
      socket.to(docId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (content) => {
      await Document.findByIdAndUpdate(docId, { content });
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client Disconnected:", socket.id);
  });
});

// Start Server
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
