const express = require('express');
const path = require('path');
const cors = require('cors');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
require('dotenv').config();
const cron = require('node-cron');
const userRoutes = require('./routes/userRoutes');
const crypto = require('crypto'); // For verifying webhook signatures
const axios = require('axios');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Database connected successfully');
    console.log('MongoDB URL:', process.env.MONGO_URL);
  })
  .catch((err) => console.error('Database connection error:', err.message));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Define API routes
app.use('/api/auth', userRoutes);
console.log('User routes mounted at /api/auth');

// Instagram Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Mode:', mode);
  console.log('Token:', token);
  console.log('Challenge:', challenge);
  console.log('Configured Token:', process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN);

  if (mode === 'subscribe' && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge); // Respond with challenge token
  } else {
    res.sendStatus(403); // Forbidden if token doesn't match
  }
});

app.get('/api/instagram-posts', async (req, res) => {
  try {
    const response = await axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`);
    const posts = response.data.data; // Array of posts
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching Instagram posts:', error.message);
    res.status(500).json({ error: 'Failed to fetch Instagram posts' });
  }
});


// Instagram Webhook Endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature'];
  const body = req.body;

  if (!signature) {
    console.error('Webhook signature missing');
    return res.sendStatus(400);
  }

  // Verify the webhook signature
  const signatureHash = signature.split('=')[1];
  const expectedHash = crypto
    .createHmac('sha1', process.env.INSTAGRAM_APP_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');

  if (signatureHash !== expectedHash) {
    console.error('Webhook signature invalid');
    return res.sendStatus(403);
  }

  console.log('Received webhook:', body);
  res.sendStatus(200);
});



// Puppeteer Function for Scraping Event Details
const fetchEventDetails = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.jsx-3208942315'); // Adjust as needed

    const eventDetails = await page.evaluate(() => {
      const events = [];
      const eventContainers = document.querySelectorAll('.jsx-3208942315'); // Adjust as needed

      eventContainers.forEach(event => {
        const title = event.querySelector('div.text-2xl')?.innerText.trim() || 'No title';
        const description = event.querySelector('div.text-base')?.innerText.trim() || 'No description';
        const date = event.querySelector('div.text-lg')?.innerText.trim() || 'No date';

        const imageElement = event.querySelector('img');
        let imageUrl = 'No image';
        if (imageElement) {
          imageUrl = imageElement.src;

          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, 'https://cherrynetwork.in').href;
          }

          console.log('Image URL:', imageUrl); // Log image URL for debugging
        }

        if (title !== 'No title' && description !== 'No description' && date !== 'No date') {
          events.push({ title, description, date, imageUrl });
        }
      });

      const uniqueEvents = Array.from(new Set(events.map(e => e.title + e.date)))
        .map(titleAndDate => {
          return events.find(e => (e.title + e.date) === titleAndDate);
        });

      return uniqueEvents;
    });

    await browser.close();
    return eventDetails;
  } catch (error) {
    console.error('Error fetching event details:', error.message);
    return [];
  }
};

// Example: Scraping Route for Events
app.get('/api/scrape-events', async (req, res) => {
  console.log('Scraping route accessed');
  try {
    const eventDetails = await fetchEventDetails('https://cherrynetwork.in/endeavour');
    console.log('Event details fetched successfully:', eventDetails);
    res.json({ events: eventDetails });
  } catch (error) {
    console.error('Error fetching event details:', error.message);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// Scheduled scraping task using cron
cron.schedule('0 * * * *', async () => {
  console.log('Scheduled scraping started');
  try {
    const eventDetails = await fetchEventDetails('https://cherrynetwork.in/endeavour');
    console.log('Event details fetched successfully:', eventDetails);
    // Here you can save the fetched event details to the database
  } catch (error) {
    console.error('Scheduled scraping error:', error.message);
  }
}, {
  scheduled: true,
  timezone: "America/New_York" // Adjust the timezone if necessary
});

// Fallback Route: Serve the React app for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global Error:', err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on Port ${port}`);
});
