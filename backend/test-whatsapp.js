require('dotenv').config();
const { sendWhatsAppMessage, getNewOrderMessage } = require('./services/whatsapp');

// Get a phone number from command line args, or use a default one for test
const targetNumber = process.argv[2] || '+919876543210'; 

console.log(`Sending test template message to ${targetNumber}...`);

// Use Meta's default built-in template to test delivery
const options = {
  type: 'template',
  templateName: 'hello_world',
  templateLanguage: 'en_US'
};

sendWhatsAppMessage(targetNumber, options)
  .then((success) => {
    if (success) {
      console.log('\n✅ Test completed successfully! The message was sent.');
    } else {
      console.log('\n❌ Test failed. Please check the logs above for details.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('\n❌ Unexpected error during test:', err);
    process.exit(1);
  });
