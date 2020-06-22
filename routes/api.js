/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const stockHandler = require('../controllers/stockHandler');

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(stockHandler);
};
