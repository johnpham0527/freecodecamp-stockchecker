const https = require('https');
require('dotenv').config();
const getDb = require('../db');
const { handleOneStock }= require('./handleOneStock');
const handleTwoStocks = require('./handleTwoStocks');

function stockHandler (req, res, next) {
    const stock2 = req.query.stock2;

    if (!stock2) { //the second stock is null, so we're handling only one stock
        handleOneStock(req, res, next);
    }

    else { //we're handling two stocks
        handleTwoStocks(req, res, next);
    }
}

module.exports = stockHandler;