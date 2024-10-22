require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

// PayU Configuration
const payuConfig = {
  merchantKey: process.env.PAYU_MERCHANT_KEY,
  merchantSalt: process.env.PAYU_MERCHANT_SALT,
  payuBaseUrl: process.env.PAYU_BASE_URL,
  successUrl: process.env.SUCCESS_URL,
  failureUrl: process.env.FAILURE_URL
};

// Generate hash using SHA512
function generateHash(data) {
  const hashString = `${payuConfig.merchantKey}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${payuConfig.merchantSalt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

// Generate a unique transaction ID
function generateTxnId() {
  return crypto.randomBytes(8).toString('hex');
}

// Render the payment form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle the PayU payment request
app.post('/paynow', (req, res) => {
  const txnId = generateTxnId();
  const paymentData = {
    key: payuConfig.merchantKey,
    txnid: txnId,
    amount: 160,
    productinfo: 'Kaalikh Book',
    firstname: "Nymoria Press",
    email: req.body.email,
    phone: req.body.phone,
    surl: payuConfig.successUrl,
    furl: payuConfig.failureUrl
  };

  paymentData.hash = generateHash(paymentData);

  // Redirect the user to the PayU payment page
  const form = `
    <form id="payuForm" method="post" action="${payuConfig.payuBaseUrl}">
      <input type="hidden" name="key" value="${paymentData.key}">
      <input type="hidden" name="txnid" value="${paymentData.txnid}">
      <input type="hidden" name="amount" value="${paymentData.amount}">
      <input type="hidden" name="productinfo" value="${paymentData.productinfo}">
      <input type="hidden" name="firstname" value="${paymentData.firstname}">
      <input type="hidden" name="email" value="${paymentData.email}">
      <input type="hidden" name="phone" value="${paymentData.phone}">
      <input type="hidden" name="surl" value="${paymentData.surl}">
      <input type="hidden" name="furl" value="${paymentData.furl}">
      <input type="hidden" name="hash" value="${paymentData.hash}">
    </form>
    <script type="text/javascript">
      document.getElementById('payuForm').submit();
    </script>
  `;
  res.send(form);
});



// Success callback
app.post('/success', (req, res) => {
  res.send('Payment successful! Transaction ID: ' + req.body.txnid);
});

// Failure callback
app.post('/failure', (req, res) => {
  res.send('Payment failed. Please try again.');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
