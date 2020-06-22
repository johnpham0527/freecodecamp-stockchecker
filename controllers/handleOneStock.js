const https = require('https');
require('dotenv').config();
const getDb = require('../db');

function handleOneStock(req, res, next) {
    console.log('Handle one stock here.');
}

module.exports = handleOneStock;