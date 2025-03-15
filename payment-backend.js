const axios = require('axios');
const crypto = require('crypto');

const visaUrl = 'https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pushfundstransactions';
const apiKey = 'your-visa-api-key';
const sharedSecret = 'your-shared-secret';

const createXPayToken = (resourcePath, queryParams, requestBody) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const hash = crypto.createHash('sha256').update(resourcePath + queryParams + requestBody + timestamp).digest('hex');
  return `xv2:${timestamp}:${hash}`;
};

const sendMoney = async (senderCard, receiverCard, amount) => {
  const resourcePath = '/visadirect/fundstransfer/v1/pushfundstransactions';
  const queryParams = '';
  const requestBody = JSON.stringify({
    systemsTraceAuditNumber: '123456',
    retrievalReferenceNumber: '123456789012',
    localTransactionDateTime: new Date().toISOString(),
    senderCardNumber: senderCard.number,
    senderCardExpiryDate: senderCard.expiry,
    senderCurrencyCode: 'USD',
    amount: amount,
    receiverCardNumber: receiverCard.number,
    receiverCardExpiryDate: receiverCard.expiry,
  });

  const xPayToken = createXPayToken(resourcePath, queryParams, requestBody);

  try {
    const response = await axios.post(visaUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${apiKey}:${sharedSecret}`).toString('base64')}`,
        'x-pay-token': xPayToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending money:', error.response.data);
    throw error;
  }
};

// Example usage
const senderCard = { number: '4111111111111111', expiry: '2025-12' };
const receiverCard = { number: '4222222222222222', expiry: '2026-10' };
sendMoney(senderCard, receiverCard, 100)
  .then(response => console.log('Transaction successful:', response))
  .catch(error => console.error('Transaction failed:', error));