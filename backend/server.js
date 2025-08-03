// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const HelpRequest = require('./models/HelpRequest');
const Volunteer = require('./models/Volunteer');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// SIGN-UP
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await Volunteer.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const newUser = new Volunteer({ name, email, password });
    await newUser.save();
    res.status(200).json({ message: "User created!" });
  } catch (err) {
    console.error("Signup failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Volunteer.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.password !== password) return res.status(401).json({ message: "Incorrect password" });

    res.status(200).json({ message: "Login successful", volunteerId: user._id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// SUBMIT REQUEST
app.post('/help-request', async (req, res) => {
  try {
    const newRequest = new HelpRequest(req.body);
    await newRequest.save();
    res.status(200).json({ message: "Help request submitted!" });
  } catch (err) {
    console.error("Failed to save help request:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL REQUESTS
app.get('/help-requests', async (req, res) => {
  try {
    const requests = await HelpRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error("Failed to fetch help requests:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ACCEPT / DECLINE REQUEST
app.post('/request/:id/decision', async (req, res) => {
  const { id } = req.params;
  const { decision, volunteerId } = req.body;

  try {
    const request = await HelpRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (decision === 'accept') {
      request.status = 'Accepted';
      request.volunteerId = volunteerId;
    } else if (decision === 'decline') {
      request.status = 'Declined';
    } else {
      return res.status(400).json({ message: 'Invalid decision' });
    }

    await request.save();
    res.status(200).json({ message: `Request ${decision}ed.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET MY ACCEPTED REQUESTS
app.get('/my-requests/:volunteerId', async (req, res) => {
  const { volunteerId } = req.params;
  try {
    const accepted = await HelpRequest.find({
      volunteerId,
      status: 'Accepted',
    }).sort({ createdAt: -1 });
    res.status(200).json(accepted);
  } catch (err) {
    console.error("Failed to fetch accepted requests:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


// Mark request as completed and award hours
app.post('/request/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { volunteerId } = req.body;

  try {
    const request = await HelpRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // prevent double-completing
    if (request.status === "Completed") {
      return res.status(400).json({ message: "Request already completed" });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

    // update request
    request.status = "Completed";
    await request.save();

    // update volunteer hours (assume 1 hour per request)
    volunteer.communityServiceHours += 1;
    await volunteer.save();

    res.status(200).json({ message: "Marked as completed and hours awarded!" });
  } catch (err) {
    console.error("Error completing request:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET volunteer's total community service hours
app.get('/volunteer/:id/hours', async (req, res) => {
  const { id } = req.params;
  try {
    const volunteer = await Volunteer.findById(id);
    if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
    res.status(200).json({ hours: volunteer.communityServiceHours });
  } catch (err) {
    console.error("Error fetching volunteer hours:", err);
    res.status(500).json({ message: "Server error" });
  }
});
