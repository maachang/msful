// ユニークID生成.
//

module.exports = (function (_g) {
  'use strict';

  // big-integer.
  var bigInt = require("big-integer");

  // サーバID.
  var serverId = require("./subs/serverId");

  // 数値系処理系.
  var nums = require("./nums");

  // 初期化処理.
  var _init = function(seet) {
    if(!seet) {
      seet = nums.getNanoTime();
    }
    // 対象のseetで初期化.
    serverId.rawId(1, seet, true);
  }

  // ユニークなuuidの取得.
  var _getUUID = function() {
    return serverId.rawId(1);
  }

  // IDを追加.
  var _nextNumberId = function(src) {
    var res = serverId.rawId(1, null, true);
    return src + res[0] + res[1] + res[2] + res[3];
  }

  // 指定文字数の数値のみのユニークIDを取得.
  var _getNumberId = function(size) {
    size = size|0;
    if(size <= 0) {
      size = 10;
    }
    var ret = _nextNumberId("");
    if(ret.length < size) {
      while(true) {
        ret = _nextNumberId(ret);
        if(ret.length >= size) {
          break;
        }
      }
    }
    return ret.substring(0, size);
  }

  // 64進数変換.
  // 数値のＩＤなどを短縮する場合に利用します.
  var _CODE64 = 'abcdefghijklmnopqrstuvwxyz+ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789';
  var _code64 = function(no) {
    no = bigInt(no);
    var n = _CODE64;
    var m = null;
    var ret = "";
    while(no.geq(64)) {
      
      m = no.divmod(64)
      ret += n[m.remainder.toJSNumber()];
      no = m.quotient;
    }
    ret += n[no.divmod(64).remainder.toJSNumber()]
    return ret;
  }

  // 64進数を文字変換.
  // code64で短縮化された情報に対して、元の値に戻す場合に利用します.
  var _decode64 = function(code) {
    var ret = bigInt(0);
    var len = code.length;
    var n = _CODE64;
    for(var i = len-1 ; i >= 0; i --) {
      ret = ret.multiply(64);
      ret = ret.add(n.indexOf(code[i]));
    }
    return ret.toString(10);
  }

  return {
    // 乱数初期化.
    init: function(seet) {
      _init(seet);
    },
    // uuidを取得.
    getUUID: function() {
      return _getUUID();
    },
    // 数値のIDを桁数指定して取得.
    getId: function(size) {
      return _getNumberId(size);
    },
    // getIdを短縮文字列(64進数)に変換.
    code64: function(no) {
      return _code64(no);
    },
    // 短縮文字列(64進数)をgetIdの情報に変換.
    decode64: function(code) {
      return _decode64(code)
    }
  }
})(global)