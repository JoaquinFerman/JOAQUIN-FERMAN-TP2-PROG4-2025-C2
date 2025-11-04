// Server functions have been migrated to Render.
// This placeholder ensures Vercel functions return a clear message rather than attempting to run the server locally.
module.exports = (req, res) => {
  res.status(410).json({
    message: 'Server has been moved to Render. API endpoints are no longer served from Vercel. Deploy the server on Render and update client API base URL accordingly.'
  });
};
