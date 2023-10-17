const express = require('express');
const cors = require('cors'); // Import the cors package

const app = express();
const port = 5500; // Use the same port as your project


// Use the cors middleware
app.use(cors());

// Your existing middleware and routes (if any) should go here

// Handle the POST request at '/save-data'
app.post('/save-data', (req, res) => {
  const data = req.body;
  // Here you can save the data to a database or perform any necessary actions
  console.log('Received data:', data);

  // Send a response (if needed)
  res.json({ message: 'Data saved successfully' });
});

// Start the server on the same host and port as your project
app.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
