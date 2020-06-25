/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      let likes;

      test('1 stock', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'stockData is an object');
          assert.property(res.body, 'stock', 'stockData object contains stock ticker string');
          assert.property(res.body, 'price', 'stockData contains decimal price in string format');
          assert.property(res.body, 'likes', 'stockData object contains likes, which is an integer');
          assert.isString(res.body.stock, 'stock is a string');
          assert.isString(res.body.price, 'price is a string');
          assert.isNumber(res.body.likes, 'likes is a number');
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'stockData is an object');
          assert.property(res.body, 'stock', 'stockData object contains stock ticker string');
          assert.property(res.body, 'price', 'stockData contains decimal price in string format');
          assert.property(res.body, 'likes', 'stockData object contains likes, which is an integer');
          assert.isString(res.body.stock, 'stock is a string');
          assert.isString(res.body.price, 'price is a string');
          assert.isNumber(res.body.likes, 'likes is a number');

          likes = res.body.likes; //we'll need to reference this updated likes value for the next test

          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'stockData is an object');
          assert.property(res.body, 'stock', 'stockData object contains stock ticker string');
          assert.property(res.body, 'price', 'stockData contains decimal price in string format');
          assert.property(res.body, 'likes', 'stockData object contains likes, which is an integer');
          assert.isString(res.body.stock, 'stock is a string');
          assert.isString(res.body.price, 'price is a string');
          assert.isNumber(res.body.likes, 'likes is a number');
          assert.equal(res.body.likes, likes, 'likes should not be double-counted and incremented');
          
          done();
        });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', stock2: 'msft'})
        .end(function(err, res) {        
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'the returned object is an array');
          assert.equal(res.body.length, 2, 'the returned array has two stock elements');
          assert.property(res.body[0], 'stock', 'the first stock contains stock ticker string');
          assert.property(res.body[0], 'price', 'the first stock contains decimal price in string format');
          assert.property(res.body[0], 'rel_likes', 'the first stock contains rel_likes, which is an integer');
          assert.property(res.body[1], 'stock', 'the second stock contains stock ticker string');
          assert.property(res.body[1], 'price', 'the second stock contains decimal price in string format');
          assert.property(res.body[1], 'rel_likes', 'the second stock contains rel_likes, which is an integer');   
          done();
        })
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', stock2: 'msft', like: 'true'})
        .end(function(err, res) {        
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'the returned object is an array');
          assert.equal(res.body.length, 2, 'the returned array has two stock elements');
          assert.property(res.body[0], 'stock', 'the first stock contains stock ticker string');
          assert.property(res.body[0], 'price', 'the first stock contains decimal price in string format');
          assert.property(res.body[0], 'rel_likes', 'the first stock contains rel_likes, which is an integer');
          assert.property(res.body[1], 'stock', 'the second stock contains stock ticker string');
          assert.property(res.body[1], 'price', 'the second stock contains decimal price in string format');
          assert.property(res.body[1], 'rel_likes', 'the second stock contains rel_likes, which is an integer');   
          done();
        })
      });

    });

});
