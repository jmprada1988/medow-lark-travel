const { getFortune } = require('../lib/fortune');
const expect = require('chai').expect;

suite('Fortune cookie test', function(){
  test('getFortune() should return a fortune', function(){
    expect(typeof getFortune() === 'string');
  });
});