const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const HelpRequest = require('./models/HelpRequest');

// Load environment variables from root-level .env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log("DEBUG MONGO_URI:", process.env.MONGO_URI);


const Volunteer = require('./models/Volunteer');

const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

// Connect to MongoDB
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Sign-up route
app.post('/signup', async (req, res) => {
  console.log("🔵 /signup endpoint hit");
  console.log("Request body:", req.body);
  const { name, email, password } = req.body;
  console.log("🟡 Signup hit:", { name, email, password }); // Log incoming data
  try {
    const existing = await Volunteer.findOne({ email });
    console.log("🔍 Existing volunteer:", existing);
    if (existing) return res.status(400).json({ message: "User already exists" });

    const newUser = new Volunteer({ name, email, password });
    await newUser.save();
    console.log("✅ Volunteer saved:", newUser);
    res.status(200).json({ message: "User created!" });
  } catch (err) {
    console.error("❌ Signup failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Log-in route
app.post('/login', async (req, res) => {
  console.log("🟠 /login endpoint hit");
  console.log("Request body:", req.body);

  const { email, password } = req.body;

  try {
    const user = await Volunteer.findOne({ email });

    if (!user) {
      console.log("❌ No user found");
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      console.log("❌ Incorrect password");
      return res.status(401).json({ message: "Incorrect password" });
    }

    console.log("✅ Login successful:", user.email);
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Help request submission route
app.post('/help-request', async (req, res) => {
  try {
    const newRequest = new HelpRequest(req.body);
    await newRequest.save();
    console.log("✅ Help request saved:", newRequest);
    res.status(200).json({ message: "Help request submitted!" });
  } catch (err) {
    console.error("❌ Failed to save help request:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Fetch all help requests (for volunteers)
app.get('/help-requests', async (req, res) => {
  try {
    const requests = await HelpRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error("❌ Failed to fetch help requests:", err);
    res.status(500).json({ message: "Server error" });
  }
});






app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
