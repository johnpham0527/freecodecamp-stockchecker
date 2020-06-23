const https = require('https');
require('dotenv').config();
const getDb = require('../db');

function handleTwoStocks(req, res, next) {
    console.log('Handle two stocks');

    const stock1 = req.query.stock;
    const stock2 = req.query.stock2;
    const likeBoolean = req.query.like;
    const ipAddress = req.ipInfo.ip;
    const link1 = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock1}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    const link2 = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock2}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    const likes1 = 0; //default value for likes for stock #1
    const likes2 = 0; //default value for likes for stock #2
    const price1 = 0; //default price for likes for stock #1
    const price2 = 0; //default price for likes for stock #2

    getDb.then(function(db) {
        const stockRequest1 = https.get(link1, function(stockResponse1) {
            stockResponse1.setEncoding('utf8');
            let rawData1 = '';

            stockResponse1.on('data', function(chunk) {
                rawData += chunk;
            });

            stockResponse1.on('end', function() {
                
            })
        })
    })

}

module.exports = handleTwoStocks;