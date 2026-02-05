const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 In-memory storage
let pickupRequests = [];

// 🔹 Seller creates pickup request (frontend must provide verified lat/lng)
app.post('/api/request-pickup', (req, res) => {
  const { sellerName, phone, email, address, weight, type, lat, lng, date } = req.body || {};

  if (!sellerName || !phone || !email || !address || !weight) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newRequest = {
    id: Date.now(),
    sellerName,
    phone,
    email,
    address,
    weight,
    type: type || 'Perishables',
    date: date || null,
    lat: typeof lat === 'number' ? lat : (lat ? parseFloat(lat) : null),
    lng: typeof lng === 'number' ? lng : (lng ? parseFloat(lng) : null),
    status: 'Pending',
  };

  pickupRequests.push(newRequest);
  res.status(201).json(newRequest);
});

// 🔹 Logistics views all requests
app.get("/api/requests", (req, res) => {
  res.json(pickupRequests);
});

// 🔹 Logistics accepts a request
app.post("/api/accept-request/:id", (req, res) => {
  const requestId = parseInt(req.params.id);

  const request = pickupRequests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  request.status = "Accepted";
  res.json(request);
});

app.listen(5000, () => {
  console.log("🚛 Blue Compass backend running on port 5000");
});