const Razorpay = require('razorpay');

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_meditrack12345';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_for_dev_mode';

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });
} catch (error) {
  console.warn(`[Razorpay Init Warning]: ${error.message}. Simulation fallback enabled.`);
}

module.exports = {
  razorpayInstance,
  key_id,
  key_secret,
};
