var assert = require('assert');
var base58 = require('..').base58;
var base58Check = require('..').base58Check;

var testData = [
  ["61", "2g", "C2dGTwc"],
  ["626262", "a3gV", "4jF5uERJAK"],
  ["636363", "aPEr", "4mT4krqUYJ"],
  ["73696d706c792061206c6f6e6720737472696e67", "2cFupjhnEsSn59qHXstmK2ffpLv2", "BXF1HuEUCqeVzZdrKeJjG74rjeXxqJ7dW"],
  ["00eb15231dfceb60925886b67d065299925915aeb172c06647", "1NS17iag9jJgTHD1VXjvLCEnZuQ3rJDE9L", "13REmUhe2ckUKy1FvM7AMCdtyYq831yxM3QeyEu4"],
  ["516b6fcd0f", "ABnLTmg", "237LSrY9NUUas"],
  ["bf4f89001e670274dd", "3SEo3LWLoPntC", "GwDDDeduj1jpykc27e"],
  ["572e4794", "3EFU7m", "FamExfqCeza"],
  ["ecac89cad93923c02321", "EJDM8drfXA6uyA", "2W1Yd5Zu6WGyKVtHGMrH"],
  ["10c8511e", "Rt5zm", "3op3iuGMmhs"],
  ["00000000000000000000", "1111111111", "111111111146Momb"],
  ["", "", "3QJmnh"],
  ["0062e907b15cbf27d5425399ebf6f0fb50ebb88f18", "12NvYg7CXwVYtMDYia7n9viekJ6d5", "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"]
];

var invalidTestData = [
  "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb"
];

suite('basic');

test('allData', function() {
  base58.encodeTest = function(raw, b58str) {
    assert.equal(base58.encode(raw), b58str);
  };

  base58.decodeTest = function(raw, b58str) {
    assert.equal(raw.toString('hex'), base58.decode(b58str).toString('hex'));
  };

  base58Check.encodeTest = function(raw, b58str) {
    assert.equal(base58Check.encode(raw), b58str);
  };

  base58Check.decodeTest = function(raw, b58str) {
    assert.equal(raw.toString('hex'), base58Check.decode(b58str).toString('hex'));
  };

  testData.forEach(function(datum) {
    var raw = new Buffer(datum[0], 'hex');
    var b58 = datum[1];
    var b58Check = datum[2];

    base58.encodeTest(raw, b58);
    base58.decodeTest(raw, b58);
    base58Check.encodeTest(raw, b58Check);
    base58Check.decodeTest(raw, b58Check);
  });

  base58Check.invalidDecodeTest = function(b58str) {
    assert.throws(function(){
        base58Check.decode(b58str);
      },
      /checksum mismatch/
    );
  };

  invalidTestData.forEach(function(datum) {
    base58Check.invalidDecodeTest(datum);
  });
});
