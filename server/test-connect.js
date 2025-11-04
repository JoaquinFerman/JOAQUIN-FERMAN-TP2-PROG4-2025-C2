const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || '<REPLACE_WITH_YOUR_MONGODB_URI>';

async function test() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected to MongoDB successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

test();
