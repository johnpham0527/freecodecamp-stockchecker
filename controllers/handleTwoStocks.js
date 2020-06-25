const https = require('https');
const http = require(`http`);
require('dotenv').config();
const getDb = require('../db');
const { getPrice, getLikesFromExistingStock, getLikesFromNewStock } = require('./handleOneStock');

function handleTwoStocks(req, res, next) {
    console.log('Handle two stocks');

    const stock1 = req.query.stock;
    const stock2 = req.query.stock2;
    const likeBoolean = req.query.like;
    const ipAddress = req.ipInfo.ip;
    const link1 = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock1}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    const link2 = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock2}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    let likes1 = 0; //default value for likes for stock #1
    let likes2 = 0; //default value for likes for stock #2

    getDb.then(function(db) {
        const stockRequest1 = https.get(link1, function(stockResponse1) { //get stock quote for stock #1
            stockResponse1.setEncoding('utf8');
            let rawData1 = '';
            let stockData1 = {};
            let stockData2 = {};

            stockResponse1.on('data', function(chunk1) {
                rawData1 += chunk1;
            });

            stockResponse1.on('end', function() {
                try {
                    db.collection('stocks').findOne({stock: stock1}, function(err, result) {
                        if (err) {
                            console.log(`Error finding stock in database: ${err}`);
                            return next(err);
                        }
            
                        if (!result) { //the stock doesn't already exist in the database
                            likes1 = getLikesFromNewStock(stock1, likeBoolean, ipAddress, db); //insert new stock into database and get the number of likes (1)
                        }
                        else { //the stock exists in the database
                            likes1 = getLikesFromExistingStock(result, stock1, likeBoolean, ipAddress, db);
                        }

                        stockData1 = {
                            stock: stock1,
                            price: getPrice(rawData1),
                        };
                    })

                    const stockRequest2 = https.get(link2, function(stockResponse2) { //get stock quote for stock #2
                        stockResponse2.setEncoding('utf8');
                        let rawData2 = '';

                        stockResponse2.on('data', function(chunk2) {
                            rawData2 += chunk2;
                        })

                        stockResponse2.on('end', function() {
                            try {
                                db.collection('stocks').findOne({stock: stock2}, function(err, result) {
                                    if (err) {
                                        console.log(`Error finding stock in database: ${err}`);
                                        return next(err);
                                    }
                        
                                    if (!result) { //the stock doesn't already exist in the database
                                        likes2 = getLikesFromNewStock(stock2, likeBoolean, ipAddress, db); //insert new stock into database and get the number of likes (1)
                                    }
                                    else { //the stock exists in the database
                                        likes2 = getLikesFromExistingStock(result, stock2, likeBoolean, ipAddress, db);
                                    }
            
                                    stockData2 = {
                                        stock: stock2,
                                        price: getPrice(rawData2),
                                    };

                                    //calculate and assign rel_likes
                                    stockData1.rel_likes = likes1 - likes2;
                                    stockData2.rel_likes = likes2 - likes1;

                                    res.json([stockData1, stockData2]); //return an array of two elements: stockData1 and stockData2
                                })
                            }
                            catch(err) {
                                console.error(`Error parsing chunk data from API for the second stock: ${err}`);
                            }
                        })
                    })
                    .on('error', function(err) {
                        console.error(`Received error while requesting second stock quote: ${err}`);
                        return next(err); 
                    })

                    stockRequest2.end();


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