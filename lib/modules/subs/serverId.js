// msful固有のIDを管理.
//

module.exports = (function(_g) {
  "use strict";

  // fs.
  var fs = require("fs");

  // 数値情報.
  var nums = require("../nums");

  // ゼロサプレス.
  var _z2 = function(n) {
    return "00".substring(n.length) + n;
  }

  // UUIDを生成.
  var _createUUID = function(count) {
    count = count|0;
    var rand = new nums.Xor128(nums.getNanoTime())
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
    var a = rand.next();
    var b = rand.next();
    var c = rand.next();
    var d = rand.next();
    
    return _z2(((a & 0xff000000) >> 24).toString(16)) +
      _z2(((a & 0x00ff0000) >> 16).toString(16)) +
      _z2(((a & 0x0000ff00) >> 8).toString(16)) +
      _z2(((a & 0x000000ff)).toString(16)) +
      "-" +
      _z2(((b & 0xff000000) >> 24).toString(16)) +
      _z2(((b & 0x00ff0000) >> 16).toString(16)) +
      "-" +
      _z2(((b & 0x0000ff00) >> 8).toString(16)) +
      _z2(((b & 0x000000ff)).toString(16)) +
      "-" +
      _z2(((c & 0xff000000) >> 24).toString(16)) +
      _z2(((c & 0x00ff0000) >> 16).toString(16)) +
      "-" +
      _z2(((c & 0x0000ff00) >> 8).toString(16)) +
      _z2(((c & 0x000000ff)).toString(16)) +
      _z2(((d & 0xff000000) >> 24).toString(16)) +
      _z2(((d & 0x00ff0000) >> 16).toString(16)) +
      _z2(((d & 0x0000ff00) >> 8).toString(16)) +
      _z2(((d & 0x000000ff)).toString(16));
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
  var _SAVE_SERVER_ID_FILE_NAME = "./.msful_Id";

  // サーバID生成回数.
  var _CREATE_SERVER_ID_COUNT = 1000000;

  // サーバIDを生成、取得処理.
  return {
    // サーバIDを生成(再生成)する.
    createId: function() {
      var ret = _createUUID(_CREATE_SERVER_ID_COUNT);
      _saveServerId(_SAVE_SERVER_ID_FILE_NAME, ret);
      return ret;
    },
    // サーバIDがが存在するかチェック.
    isId: function() {
      return _isServerId(_SAVE_SERVER_ID_FILE_NAME);
    },
    // サーバIDが存在しない場合は作成して取得.
    // 既にサーバIDが生成されている場合も取得.
    getId: function() {
      var ret = null;
      // サーバIDが存在しない場合は、作成.
      if(!_isServerId(_SAVE_SERVER_ID_FILE_NAME)) {
        ret = _createUUID(_CREATE_SERVER_ID_COUNT);
        _saveServerId(_SAVE_SERVER_ID_FILE_NAME, ret);
      } else {
        ret = _getServerId(_SAVE_SERVER_ID_FILE_NAME);
      }
      return ret;
    }
  };
})(global);