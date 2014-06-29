var crypto = require('crypto');

var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var ALPHABET_INV = {};
for(var i=0; i < ALPHABET.length; i++) {
  ALPHABET_INV[ALPHABET[i]] = i;
}

// Vanilla Base58 Encoding
var base58 = {
  encode: function(buf) {
    if(buf.length == 0) return '';

    var i, j, digits = [0];
    for(i = 0; i < buf.length; i++) {
      for(j = 0; j < digits.length; j++) {
        digits[j] <<= 8;
      }
      digits[digits.length - 1] += buf[i];

      var carry = 0;
      for(j = digits.length - 1; j >= 0; j--){
        digits[j] += carry;
        carry = (digits[j] / 58) | 0;
        digits[j] %= 58;
      }

      while(carry) {
        digits.unshift(carry);
        carry = (digits[0] / 58) | 0;
        digits[0] %= 58;
      }
    }

    // deal with leading zeros
    for(i = 0; i < buf.length - 1 && buf[i] == 0; i++) {
      digits.unshift(0);
    }

    return digits.map(function(digit) { return ALPHABET[digit]; }).join('');
  },

  decode: function(str) {
    if(str.length == 0) return new Buffer([]);

    var input = str.split('').map(function(c){ return ALPHABET_INV[c]; });

    var i, j, bytes = [0];
    for(i = 0; i < input.length; i++) {
      for(j = 0; j < bytes.length; j++) {
        bytes[j] *= 58;
      }
      bytes[bytes.length - 1] += input[i];

      var carry = 0;
      for(j = bytes.length - 1; j >= 0; j--){
        bytes[j] += carry;
        carry = bytes[j] >> 8;
        bytes[j] &= 0xff;
      }

      while(carry) {
        bytes.unshift(carry);
        carry = bytes[0] >> 8;
        bytes[0] &= 0xff;
      }
    }

    for(i = 0; i < input.length - 1 && input[i] == 0; i++) {
      bytes.unshift(0);
    }

    return new Buffer(bytes);
  }
};

// Base58Check Encoding
function sha256(data) {
  return new Buffer(crypto.createHash('sha256').update(data).digest('binary'), 'binary');
}

function doubleSHA256(data) {
  return sha256(sha256(data));
}

var base58Check = {
  encode: function(buf) {
    var checkedBuf = new Buffer(buf.length + 4);
    var hash = doubleSHA256(buf);
    buf.copy(checkedBuf);
    hash.copy(checkedBuf, buf.length);
    return base58.encode(checkedBuf);
  },

  decode: function(s) {
    var buf = base58.decode(s);
    if (buf.length < 4) {
      throw new Error("invalid input: too short");
    }

    var data = buf.slice(0, -4);
    var csum = buf.slice(-4);

    var hash = doubleSHA256(data);
    var hash4 = hash.slice(0, 4);

    if (csum.toString() != hash4.toString()) {
      throw new Error("checksum mismatch");
    }

    return data;
  }
};

exports.base58 = base58;
exports.base58Check = base58Check;
exports.encode = base58.encode;
exports.decode = base58.decode;
