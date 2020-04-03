var express = require('express');
var router = express.Router();
const BTCPAY_PRIV_KEY = process.env.BTCPAY_PRIV_KEY;
const BTCPAY_MERCHANT_KEY = process.env.BTCPAY_MERCHANT_KEY;

// Initialize the client
const btcpay = require('btcpay')
const keypair = btcpay.crypto.load_keypair(new Buffer.from(BTCPAY_PRIV_KEY, 'hex'));
const client = new btcpay.BTCPayClient('https://lightning.filipmartinsson.com', keypair, {merchant: BTCPAY_MERCHANT_KEY})


/* get & verify invoice. */
router.get('/:id', async function(req, res, next) {
    const invoiceId = req.params.id
    await client.get_invoice(invoiceId)
        .then(invoice => {
            if (invoice.status == 'complete' || invoice.status == 'paid')
                res.end('thank you')
            else
                res.end('not paid')
        })
        .catch(err => console.error(err))
});

/* Create invoice. */
router.post('/', function(req, res, next) {
    const amount = req.body.amount
    const payload = {
        price: amount,
        currency: 'USD'
    }
    client.create_invoice(payload)
        .then(invoice => {
            console.log(invoice)
            res.render('invoice', { invoiceId: invoice.id})
        })
        .catch(err => {console.error(err)})
});


module.exports = router;
