// ユニークID生成.
//

module.exports = (function (_g) {
  'use strict';

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
    }
  }
})(global)