import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util.js';
import url from 'url';

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// Endpoint to filter an image from a public URL.
// It should:
//    1. Validate the image_url query.
//    2. Call filterImageFromURL(image_url) to filter the image.
//    3. Send the resulting file in the response.
//    4. Delete any files on the server on finish of the response.
// QUERY PARAMETERS:
//    image_url: URL of a publicly accessible image
// RETURNS:
//   The filtered image file [!!TIP res.sendFile(filteredpath); might be useful].

app.get('/filteredimage', async (req, res) => {
  const { image_url } = req.query;

  // Validate that image_url is provided and is a valid URL
  if (!image_url) {
    return res.status(400).send('The image_url query parameter is required.');
  }

  try {
    // Use the URL constructor to validate the URL format
    new url.URL(image_url);
  } catch (_) {
    return res.status(400).send('Invalid URL format.');
  }

  try {
    // Call filterImageFromURL to filter the image
    const filteredPath = await filterImageFromURL(image_url);

    // Send the filtered image file in the response
    res.sendFile(filteredPath, (err) => {
      if (err) {
        console.error('Error sending filtered image:', err);
        return res.status(500).send('Error sending the filtered image.');
      }

      // Delete the local file after sending the response
      deleteLocalFiles([filteredPath]);
    });
  } catch (err) {
    console.error('Error processing image:', err);
    res.status(422).send('Unable to process the image. Please check the provided image URL.');
  }
});

//! END @TODO1

// Root Endpoint
// Displays a simple message to the user
app.get('/', async (req, res) => {
  res.send('Try GET /filteredimage?image_url={{}}');
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Press CTRL+C to stop the server');
});
