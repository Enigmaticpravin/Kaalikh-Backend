const crypto = require('crypto');

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Extract form data from request body
    const { email, phone } = req.body;
    const txnId = crypto.randomBytes(8).toString('hex');
    
    const paymentData = {
      key: process.env.PAYU_MERCHANT_KEY,
      txnid: txnId,
      amount: 160,
      productinfo: 'Kaalikh Book',
      firstname: "Nymoria Press",
      email: email,
      phone: phone,
      surl: process.env.SUCCESS_URL,
      furl: process.env.FAILURE_URL
    };

    // Generate hash
    const hashString = `${paymentData.key}|${paymentData.txnid}|${paymentData.amount}|${paymentData.productinfo}|${paymentData.firstname}|${paymentData.email}|||||||||||${process.env.PAYU_MERCHANT_SALT}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    paymentData.hash = hash;

    // Send HTML form response for PayU
    res.status(200).send(`
      <form id="payuForm" method="post" action="${process.env.PAYU_BASE_URL}">
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
      <script type="text/javascript">document.getElementById('payuForm').submit();</script>
    `);
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
  }
}
