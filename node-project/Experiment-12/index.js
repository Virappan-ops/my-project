const express = require('express');
const app = express();
const port = 3000;

// This is the line that makes all JSON output pretty-printed
app.set('json spaces', 2);

app.use(express.json());

// --- Data Store and Configuration ---

// Lock timeout in milliseconds (e.g., 60 seconds)
const LOCK_TIMEOUT = 60 * 1000; 

// In-memory object to store the state of all seats
const seats = {
  '1': { status: 'available' },
  '2': { status: 'available' },
  '3': { status: 'available' },
  '4': { status: 'available' },
  '5': { status: 'available' },
  '6': { status: 'available' },
  '7': { status: 'available' },
  '8': { status: 'available' },
};

// --- API Routes ---

// GET /seats - View the status of all seats
app.get('/seats', (req, res) => {
  res.json(seats);
});

// POST /lock/:seatId - Lock a specific seat
app.post('/lock/:seatId', (req, res) => {
  const { seatId } = req.params;
  
  if (!seats[seatId]) {
    return res.status(404).json({ message: 'Seat not found' });
  }

  const seat = seats[seatId];
  const now = Date.now();

  // Check if seat is already booked or if it's locked and the lock is still valid
  if (seat.status === 'booked') {
    return res.status(400).json({ message: 'Seat is already booked' });
  }

  if (seat.status === 'locked' && (now - seat.lockTimestamp < LOCK_TIMEOUT)) {
    return res.status(400).json({ message: 'Seat is currently locked by another user' });
  }

  // Lock the seat
  seat.status = 'locked';
  seat.lockTimestamp = now;
  console.log(`Seat ${seatId} locked at ${now}`);

  // Set a timer to automatically release the lock after the timeout
  setTimeout(() => {
    // Only release the lock if it's still locked by this specific lock action
    if (seats[seatId].status === 'locked' && seats[seatId].lockTimestamp === now) {
      seats[seatId].status = 'available';
      delete seats[seatId].lockTimestamp;
      console.log(`Lock for seat ${seatId} expired. Seat is now available.`);
    }
  }, LOCK_TIMEOUT);

  res.json({ message: `Seat ${seatId} locked successfully. Confirm within 1 minute.` });
});

// POST /confirm/:seatId - Confirm the booking for a locked seat
app.post('/confirm/:seatId', (req, res) => {
  const { seatId } = req.params;

  if (!seats[seatId]) {
    return res.status(404).json({ message: 'Seat not found' });
  }

  const seat = seats[seatId];
  const now = Date.now();

  // Booking can only be confirmed if the seat is currently locked
  if (seat.status !== 'locked') {
    return res.status(400).json({ message: 'Seat is not locked and cannot be booked' });
  }
  
  // Check if the lock has expired
  if (now - seat.lockTimestamp > LOCK_TIMEOUT) {
    // If expired, make it available again
    seat.status = 'available';
    delete seat.lockTimestamp;
    return res.status(400).json({ message: 'Lock has expired. Please try locking the seat again.' });
  }

  // Confirm the booking
  seat.status = 'booked';
  delete seat.lockTimestamp;

  res.json({ message: `Seat ${seatId} booked successfully!` });
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Ticket booking server is running at http://localhost:${port}`);
});