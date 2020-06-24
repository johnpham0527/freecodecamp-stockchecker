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
        const stockRequest1 = https.get(link1, function(stockResponse1) { //get stock quote for stock #1
            stockResponse1.setEncoding('utf8');
            let rawData1 = '';

            stockResponse1.on('data', function(chunk1) {
                rawData += chunk;
            });

            stockResponse1.on('end', function() {
                try {
                    const stockRequest2 = https.get(link2, function(stockResponse2) { //get stock quote for stock #2
                        stockResponse2.setEncoding('utf8');
                        let rawData2 = '';

                        stockResponse2.on('data', function(chunk2) {
                            rawData2 += chunk2;
                        })

                        stockResponse2.on('end', function() {
                            try {
                                const parsedData1 = JSON.parse(rawData1);
                                const timeSeries = parsedData1['Time Series (5min)']; //parse only the time series data
                                const mostRecentKey1 = Object.keys(timeSeries)[0]; //obtain the most recent key
                                price1 = timeSeries[mostRecentKey1]['4. close']; //set price to the last five-minute interval's closing quote


                                const parsedData2 = JSON.parse(rawData2);
                                const timeSeries = parsedData2['Time Series (5min)']; //parse only the time series data
                                const mostRecentKey2 = Object.keys(timeSeries)[0]; //obtain the most recent key
                                price2 = timeSeries[mostRecentKey2]['4. close']; //set price to the last five-minute interval's closing quote

                                console.log(`price1 is ${price1} and price2 is ${price2}`);

                            }
                            catch {
                                console.error(`Error parsing chunk data from API for the second stock: ${err}`);
                            }

                        })


                    })




                }
                catch(err) {
                    console.error(`Error parsing chunk data from API for the first stock: ${err}`);
                }
            })
        })
            .on('error', function(err) {
                console.error(`Received error while requesting first stock quote: ${err}`);
                return next(err);
            })
        
        stockRequest1.end();
    })

}

module.exports = handleTwoStocks;