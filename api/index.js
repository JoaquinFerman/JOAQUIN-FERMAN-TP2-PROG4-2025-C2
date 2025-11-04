// Ensure the Nest serverless handler is reachable at the root path (/)
// This file loads the compiled server handler from the copied dist folder
let handlerModule;
try {
  handlerModule = require('./dist/src/serverless');
} catch (err) {
  console.error('Could not load serverless handler from ./dist/src/serverless.js', err);
  module.exports = (req, res) => {
    res.status(500).send('Server not built. Run `npm run build` to compile the server.');
  };
  return;
}

const fn = handlerModule.default || handlerModule.handler || handlerModule;
module.exports = fn;
