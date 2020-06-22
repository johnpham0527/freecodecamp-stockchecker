const https = require('https');
require('dotenv').config();
const getDb = require('../db');

function stockHandler (req, res, next) {
    const stock = req.query.stock;
    const like = req.query.like;
    let likes = 0;
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

    console.log(`request IP address is ${req.ipInfo.ip}`);
    console.log(`like is ${like}`);
    console.log(`req.query.stock is ${JSON.stringify(req.query.stock)}`);

    const link = `https://repeated-alpaca.glitch.me/v1/stock/goog/quote`
    //const link = `https://repeated-alpaca.glitch.me/v1/stock/msft/quote`
    //const link =`https://www.google.com`

    const stockRequest = https.get(link, function(stockResponse) {
    // const stockRequest = https.get(link, options, function(stockResponse) {
    //const stockRequest = https.get(`https://repeated-alpaca.glitch.com/v1/stock/${stock}/quote`, function(stockResponse) {
    // const stockRequest = https.request(options, function (stockResponse) {
        // console.log(`statusCode: ${res.statusCode}`);
        console.log(`status code is ${stockResponse.statusCode}`);
        console.log(`stockResponse.headers is ${stockResponse.headers}`);

        stockResponse.on('data', function(data) {
            price = data;
            //console.log(`data is ${data}`);
        });
    })
        .on('error', function(err) {
        console.error(`Received error while requesting stock quote: ${err}`);
        return next(err);
    })

    getDb.then(function(db) {
        let stockToFind = {
            stock: stock
        }

        db.collection('stocks').findOne(stockToFind, function(err, result) {
            if (err) {
                console.log(`Error finding stock in database: ${err}`);
                return next(err);
            }
            console.log(`The result of the database lookup is ${result}`);



            if (!result) { //no result found

                const ipArray = [];
                ipArray.push(req.ipInfo.ip);
                likes = like ? 1 : 0; //if like is true, then set likes to 1. Otherwise, it is initialized in the database as zero

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
            else {
                /*
                

                */
            }
        })
    })

    stockRequest.end();

    return res.json({
        stock: stock,
        price: price,
        likes: likes //this has to come from the database
    })

    //need to return an object {stock: 'goog', price: '1,000.40', likes: '2'}
}

module.exports = stockHandler;