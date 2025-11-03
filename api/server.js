// Vercel serverless function that delegates to the compiled Nest serverless handler
// It expects the Nest app to be built into `server/dist/src/serverless.js` by the server build step.

let handlerModule;

try {
  handlerModule = require('../server/dist/src/serverless');
} catch (err) {
  console.error('Could not load serverless handler. Make sure you ran `npm run build` in /server so the file exists at server/dist/src/serverless.js', err);
  // Expose a simple handler that returns 500 so Vercel logs show the issue
  module.exports = (req, res) => {
    res.status(500).send('Server not built. Run `npm run build` in /server.');
  };
  return;
}

const fn = handlerModule.default || handlerModule.handler || handlerModule;
module.exports = fn;
