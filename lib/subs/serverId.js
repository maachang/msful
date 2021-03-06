// msful固有のIDを管理.
//

module.exports = (function(_g) {
  "use strict";

  // fs.
  var fs = require("fs");

  // 数値情報.
  var nums = require("../nums");

  // 乱数生成オブジェクト.
  var _rand = new nums.Xor128(nums.getNanoTime());

  // UUIDを生成.
  var _createId = function(count, seet, numsFlag) {
    count = count|0;
    numsFlag = numsFlag == true || numsFlag == "true";

    // シートが設定されているのみ、再設定.
    var rand = _rand;
    if(seet) {
      rand.setSeet(seet)
    }
    var no = rand.next();
    var exitCnt = count;
    var befFlg = false;

    // ぶつかりづらい乱数を生成するための処理.
    while(true) {
      exitCnt --;
      if(exitCnt <= 0) {
        break;
      }
      if(!befFlg && ((no & 0x00000001) == 0 || (nums.getNanoTime() & 0x00000001) != 0)){
        exitCnt ++;
        if(count <= exitCnt) {
          exitCnt = count;
        }
        befFlg = true;
      } else {
        befFlg = false;
      }
      no = rand.next();
    }

    // 128byteデータ（UUID）を生成.
    var ret = [
      rand.next(),
      rand.next(),
      rand.next(),
      rand.next()
    ];

    // ４バイト数値４つ返却指定の場合.
    if(numsFlag) {
      return ret;
    }
    
    // UUID返却指定の場合.
    return nums.byte16ToUUID(ret);
  }

  // サーバIDの保存.
  var _saveServerId = function(name, value) {
    fs.writeFileSync(name, value);
  }

  // 保存されたサーバIDを取得.
  var _getServerId = function(name) {
    return fs.readFileSync(name) + "";
  }

  // ファイルが存在するかチェック.
  var _isServerId = function(name) {
    try {
      return fs.statSync(name).isFile();
    } catch(e) {
      return false;
    }
  }

  // サーバID保存ファイル名.
  var _SAVE_SERVER_ID_FILE_NAME = "./.server_id";

  // サーバID生成回数.
  var _CREATE_SERVER_ID_COUNT = 1000000;

  // サーバIDを生成、取得処理.
  return {
    // IDを生成するだけの処理.
    rawId: function(count, seet, numsFlag) {
      return _createId(count, seet, numsFlag)
    },
    // サーバIDを生成(再生成)する.
    createId: function(dir) {
      if(!dir) {
        dir = "";
      }
      var ret = _createId(_CREATE_SERVER_ID_COUNT);
      _saveServerId(dir + _SAVE_SERVER_ID_FILE_NAME, ret);
      return ret;
    },
    // サーバIDがが存在するかチェック.
    isId: function(dir) {
      if(!dir) {
        dir = "";
      }
      return _isServerId(dir + _SAVE_SERVER_ID_FILE_NAME);
    },
    // サーバIDが存在しない場合は作成して取得.
    // 既にサーバIDが生成されている場合も取得.
    getId: function(dir) {
      if(!dir) {
        dir = "";
      }
      var ret = null;
      // サーバIDが存在しない場合は、作成.
      if(!_isServerId(dir + _SAVE_SERVER_ID_FILE_NAME)) {
        ret = _createId(_CREATE_SERVER_ID_COUNT);
        _saveServerId(dir + _SAVE_SERVER_ID_FILE_NAME, ret);
      } else {
        ret = _getServerId(dir + _SAVE_SERVER_ID_FILE_NAME);
      }
      return ret;
    },
    // array(int, int, int, int)をuuidに変換.
    arrayToUUID: function(n) {
      return nums.byte16ToUUID(n);
    },
    // UUIDをarray(int, int, int, int)に変換.
    UUIDToArray: function(n) {
      return nums.uuidToByte16(n);
    }
  };
})(global);