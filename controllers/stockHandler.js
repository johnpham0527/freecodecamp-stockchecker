const https = require('https');
require('dotenv').config();

function stockHandler (req, res, next) {
    const stock = req.query.stock;

    let options = {
        hostname: 'repeated-alpaca.glitch.me',
        //hostname: `alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock}&interval=5min&apikey=${process.env.ALPHA_VANTAGE}`,
        //hostname: 'google.com',
        port: 443,
        path: '/v1/stock/' + stock + '/quote',
        method: 'GET'
    }

    let price = 0;

    console.log(`req.query.stock is ${JSON.stringify(req.query.stock)}`);

    const stockRequest = https.request(options, function (stockResponse) {
        // console.log(`statusCode: ${res.statusCode}`);
        console.log(`status code is ${stockResponse.statusCode}`);
        console.log(`stockResponse.head is ${stockResponse.head}`);

        stockResponse.on('data', function(data) {
            price = data;
        });
    });

    stockRequest.on('error', function(error) {
        console.error(`Received error while requesting stock quote: ${error}`);
        return next(error);
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