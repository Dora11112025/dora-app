const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

/**
 * Send SMS via Twilio
 * @param {string} to - Phone number (E.164 format, e.g., +19522668671)
 * @param {string} message - Message body
 * @returns {boolean} - Success status
 */
const sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: to,
    });
    console.log(`SMS sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Twilio SMS Error:', error.message);
    return false;
  }
};

module.exports = { sendSMS };
