module.exports = (req, res) => {
    res.send(`Payment successful! Transaction ID: ${req.body.txnid}`);
  };
  