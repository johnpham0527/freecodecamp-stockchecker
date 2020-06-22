const https = require('https');
require('dotenv').config();
const getDb = require('../db');

function handleTwoStocks(req, res, next) {
    console.log('Handle two stocks');
}

module.exports = handleTwoStocks;