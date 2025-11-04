// Ensure the Nest serverless handler is reachable at the root path (/)
// This file simply delegates to the compiled server handler (server/dist/src/serverless.js)
let handlerModule;
try {
  handlerModule = require('../server/dist/src/serverless');
} catch (err) {
  console.error('Could not load serverless handler from server/dist/src/serverless.js', err);
  module.exports = (req, res) => {
    res.status(500).send('Server not built. Run `npm run build` in /server.');
  };
  return;
}

const fn = handlerModule.default || handlerModule.handler || handlerModule;
module.exports = fn;
