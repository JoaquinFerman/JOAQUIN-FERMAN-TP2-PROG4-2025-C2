// Vercel serverless function that delegates to the compiled Nest serverless handler
// It expects the Nest app to be built into `server/dist/src/serverless.js` by the server build step.

// Server has been migrated to Render. This placeholder keeps the Vercel function present but returns a clear message.
module.exports = (req, res) => {
  res.status(410).json({
    message: 'Server moved to Render. API endpoints are no longer served from Vercel.'
  });
};
