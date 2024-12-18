const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

// Render the HTML page
app.get('/', (req, res) => {
  res.render('index');
});

// API endpoint for `/api/:date?`
app.get('/api/:date?', (req, res) => {
  let dateParam = req.params.date;
  let date;

  // Handle empty date parameter
  if (!dateParam) {
    date = new Date();
  } else if (/^\d+$/.test(dateParam)) {
    // Handle Unix timestamp (convert to number first)
    date = new Date(parseInt(dateParam));
  } else {
    // Handle ISO 8601 or other date string
    date = new Date(dateParam);
  }

  // Check if date is valid
  if (date.toString() === "Invalid Date") {
    return res.status(400).json({ error: "Invalid Date" });
  }

  // Return Unix and UTC formats
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// Your original `/api/convert` endpoint (if needed for the frontend)
app.post('/api/convert', (req, res) => {
  const { dateInput } = req.body;
  let date;

  try {
    // Try parsing as Unix timestamp first
    if (/^\d+$/.test(dateInput)) {
      date = new Date(parseInt(dateInput));
    } else {
      // Try parsing as date string
      date = new Date(dateInput);
    }

    if (date.toString() === "Invalid Date") {
      return res.status(400).json({ error: "Invalid Date" });
    }

    // Return relative time and other data
    const now = new Date();
    const diffInSeconds = Math.floor((date - now) / 1000);
    const absSeconds = Math.abs(diffInSeconds);
    let relativeTime = 'Just now';

    if (absSeconds >= 60) {
      const times = {
        year: Math.floor(absSeconds / (365 * 24 * 60 * 60)),
        month: Math.floor(absSeconds / (30 * 24 * 60 * 60)),
        day: Math.floor(absSeconds / (24 * 60 * 60)),
        hour: Math.floor(absSeconds / (60 * 60)),
        minute: Math.floor(absSeconds / 60),
      };

      for (const [unit, value] of Object.entries(times)) {
        if (value > 0) {
          const suffix = diffInSeconds < 0 ? 'ago' : 'from now';
          relativeTime = `${value} ${unit}${value === 1 ? '' : 's'} ${suffix}`;
          break;
        }
      }
    }

    res.json({
      unix: date.getTime(),
      utc: date.toUTCString(),
      relative: relativeTime
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid Date Format" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
