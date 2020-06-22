const https = require('https');
require('dotenv').config();
const getDb = require('../db');

async function stockHandler (req, res, next) {
    const stock = req.query.stock;
    const like = req.query.like;
    var likes = 0; //initializing variable for how many times the stock was liked
    var price = 0; //initializing variable for the price of the stock
    let ipAddress = req.ipInfo.ip;

    let options = {
        hostname: 'repeated-alpaca.glitch.me',
        //hostname: `alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock}&interval=5min&apikey=${process.env.ALPHA_VANTAGE}`,
        port: 443,
        //path: '/v1/stock/' + stock + '/quote',
        path: `/v1/stock/msft/quote`,
        method: 'GET',
        // rejectUnauthorized: false
    }

    console.log(`request IP address is ${ipAddress}`);
    console.log(`like is ${like}`);
    console.log(`req.query.stock is ${JSON.stringify(req.query.stock)}`);

    const link = `https://repeated-alpaca.glitch.me/v1/stock/goog/quote`
    //const link = `https://repeated-alpaca.glitch.me/v1/stock/msft/quote`
    //const link =`https://www.google.com`

    getDb.then(function(db) {

        const stockRequest = https.get(link, function(stockResponse) {
        // const stockRequest = https.get(link, options, function(stockResponse) {
        //const stockRequest = https.get(`https://repeated-alpaca.glitch.com/v1/stock/${stock}/quote`, function(stockResponse) {
        // const stockRequest = https.request(options, function (stockResponse) {
            // console.log(`statusCode: ${res.statusCode}`);
            //console.log(`status code is ${stockResponse.statusCode}`);
            //console.log(`stockResponse.headers is ${stockResponse.headers}`);

            stockResponse.on('data', function(data) {
                //price = data;
                //console.log(`data is ${data}`);
            });
        })
            .on('error', function(err) {
            console.error(`Received error while requesting stock quote: ${err}`);
            return next(err);
        })

        stockRequest.end();

        db.collection('stocks').findOne({stock: stock}, function(err, result) {
            if (err) {
                console.log(`Error finding stock in database: ${err}`);
                return next(err);
            }

            if (!result) { //the stock doesn't already exist in the database

                const ipArray = [];
                if (like) { //set likes to 1 and add the IP address to the array only if the stock was liked
                    likes = 1;
                    ipArray.push(ipAddress);
                }

                db.collection('stocks').insertOne({
                    stock: stock,
                    price: 0,
                    likes: likes,
                    ip: ipArray
                }, function(err, insertResult) {
                    if (err) {
                        console.log(`Error inserting stock into database: ${err}`);
                        return next(err);
                    }
                    console.log(`Inserted stock ${stock} into database successfully`);
                })
            }
            else { //the stock exists in the database
                likes = result.likes; //store the current value of likes from the database
                console.log(`likes here is ${likes}`);
                if (like) { //did the client like this stock? If so, check to see if likes needs to be increment based on the IP address
                    console.log(`The IP array contains ${result.ip} and the number of likes is ${likes}`);
                    let ipArray = result.ip;
                    if (ipArray.indexOf(ipAddress) === -1) { //the IP address doesn't exist in the result.ip array, so we need to update likes and the IP array
                        likes++; //increment likes by one
                        ipArray.push(ipAddress)//add ipAddress to the IP array
                        db.collection('stocks').updateOne({stock: stock}, { $set: {likes: likes, ip: ipArray} }, function(err, updateResult) {
                            if (err) {
                                console.log(`Error updating stock: ${err}`);
                                return next(err);
                            }
                        })
                    }
                }
            }
            
            return res.json({
                stock: stock,
                price: price,
                likes: likes
            })
            
        })
    });
}

module.exports = stockHandler;