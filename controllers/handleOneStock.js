const https = require('https');
require('dotenv').config();
const getDb = require('../db');

function getPriceAlphaVantage(rawData) { //given raw data from Alpha Vantage, get the price
    const parsedData = JSON.parse(rawData); //parse the raw data in JSON format
    const timeSeries = parsedData['Time Series (5min)']; //parse only the time series data
    const mostRecentKey = Object.keys(timeSeries)[0]; //obtain the most recent key
    return timeSeries[mostRecentKey]['4. close']; //set price to the last five-minute interval's closing quote
}

function getPriceRepeatedAlpaca(rawData) {
    const parsedData = JSON.parse(rawData);
    return parsedData.latestPrice;
}


function getLikesFromNewStock(stock, likeBoolean, ipAddress, db) {
    let likes = 0;
    const ipArray = [];
            
    if (likeBoolean) { //set likes to 1 and add the IP address to the array only if the stock was liked
        likes = 1;
        ipArray.push(ipAddress);
    }

    db.collection('stocks').insertOne({
        stock: stock,
        likes: likes,
        ip: ipArray
    }, function(err, insertResult) {
        if (err) {
            console.log(`Error inserting stock into database: ${err}`);
        }
    })

    return likes;
}

function getLikesFromExistingStock(result, stock, likeBoolean, ipAddress, db) {
    let likes = result.likes; //store the current value of likes from the database

    if (likeBoolean) { //did the client like this stock? If so, check to see if likes needs to be increment based on the IP address
        let ipArray = result.ip; //store the current value of the IP address array from the database

        if (ipArray.indexOf(ipAddress) === -1) { //the IP address doesn't exist in the result.ip array, so we need to update likes and the IP array
            likes++; //increment likes by one
            ipArray.push(ipAddress)//add ipAddress to the IP array

            db.collection('stocks').updateOne({stock: stock}, { $set: {likes: likes, ip: ipArray} }, function(err, updateResult) {
                if (err) {
                    console.log(`Error updating stock: ${err}`);
                }
            })
        }
    }

    return likes;
}

function handleLikesForExistingStock(result, stock, likeBoolean, ipAddress, db, done) { //similar to getLikesFromExistingStock, but uses the error-first callback pattern
    let likes = result.likes; //store the current value of likes from the database

    if (likeBoolean) { //did the client like this stock? If so, check to see if likes needs to be increment based on the IP address
        let ipArray = result.ip; //store the current value of the IP address array from the database

        if (ipArray.indexOf(ipAddress) === -1) { //the IP address doesn't exist in the result.ip array, so we need to update likes and the IP array'

            likes++; //increment likes by one
            ipArray.push(ipAddress)//add ipAddress to the IP array

            db.collection('stocks').updateOne({stock: stock}, { $set: {likes: likes, ip: ipArray} }, function(err, updateResult) {
                if (err) {
                    return done(err);
                }
            })
        }
    
    return done(null, likes)

    }
}



function handleOneStock(req, res, next) {
    const stock = req.query.stock;
    const like = req.query.like;
    const ipAddress = req.ipInfo.ip; //obtain the IP address using middleware
    const link = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${req.query.stock}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    //const link = `https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`

    const responseJSON = (stock, price, likes) => {
        return res.json({
            stock: stock,
            price: price,
            likes: likes
        })
    }

    getDb.then(function(db) {
        const stockRequest = https.get(link, function(stockResponse) {                 
            stockResponse.setEncoding('utf8');
            let rawData = '';

            stockResponse.on('data', function(chunk) { //this is a stream of data
                rawData += chunk; //collect the chunk data into rawData
            });

            stockResponse.on('end', function() {
                try {
                    db.collection('stocks').findOne({stock: stock}, function(err, result) {
                        let price = getPriceAlphaVantage(rawData); //get stock price
                        let likes = 0; //initializing variable for how many times the stock was liked

                        if (err) {
                            console.log(`Error finding stock in database: ${err}`);
                            return next(err);
                        }
            
                        if (!result) { //the stock doesn't already exist in the database
                            likes = getLikesFromNewStock(stock, like, ipAddress, db); //insert new stock into database and get the number of likes (1)

                            return res.json({
                                stock: stock,
                                price: price,
                                likes: likes
                            })
                        }
                        else { //the stock exists in the database
                            handleLikesForExistingStock(result, stock,
                                like, ipAddress, db, function(err, likes) {
                                    if (err) {
                                        console.log(`Error handling likes: ${err}`);
                                    }
                                    return responseJSON(stock, price, likes);
                                })
                        }
                    })
                }
                catch(err) {
                    console.error(`Error parsing chunk data from stock quote API: ${err}`);
                }
            })
        })
            .on('error', function(err) {
                console.error(`Received error while requesting stock quote: ${err}`);
                return next(err);
            })

        stockRequest.end();
    });
}

module.exports = { handleOneStock, getPriceAlphaVantage, getLikesFromNewStock, getLikesFromExistingStock, getPriceRepeatedAlpaca, handleLikesForExistingStock };