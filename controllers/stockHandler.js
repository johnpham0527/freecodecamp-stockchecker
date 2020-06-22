const https = require('https');
require('dotenv').config();

function stockHandler (req, res, next) {
    const stock = req.query.stock;
    let price = 0;

    let options = {
        hostname: 'repeated-alpaca.glitch.me',
        //hostname: `alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock}&interval=5min&apikey=${process.env.ALPHA_VANTAGE}`,
        port: 443,
        //path: '/v1/stock/' + stock + '/quote',
        path: `/v1/stock/msft/quote`,
        method: 'GET',
        // rejectUnauthorized: false
    }

    console.log(`req.query.stock is ${JSON.stringify(req.query.stock)}`);

    //const link = `https://repeated-alpaca.glitch.me/v1/stock/goog/quote`
    //const link = `https://repeated-alpaca.glitch.me/v1/stock/msft/quote`
    const link =`https://alphavantage.co`

    const stockRequest = https.get(link, function(stockResponse) {
    // const stockRequest = https.get(link, options, function(stockResponse) {
    //const stockRequest = https.get(`https://repeated-alpaca.glitch.com/v1/stock/${stock}/quote`, function(stockResponse) {
    // const stockRequest = https.request(options, function (stockResponse) {
        // console.log(`statusCode: ${res.statusCode}`);
        console.log(`status code is ${stockResponse.statusCode}`);
        console.log(`stockResponse.headers is ${stockResponse.headers}`);

        stockResponse.on('data', function(data) {
            price = data;
            console.log(`data is ${data}`);
        });
    })
        .on('error', function(err) {
        console.error(`Received error while requesting stock quote: ${err}`);
        return next(err);
    })

    stockRequest.end();

    return res.json({
        stock: stock,
        price: price,
        likes: '0' //this has to come from the database
    })

    //need to return an object {stock: 'goog', price: '1,000.40', likes: '2'}
}

module.exports = stockHandler;