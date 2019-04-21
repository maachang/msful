// file.js
// 同期系ファイルI/O処理.
//

module.exports = (function (_g) {
  'use strict';

  var fs = require("fs");
  var o = {};

  // ファイルチェック.
  var _isFile = function(name) {
    try {
      // try / catchで囲まないと、ファイルが無ければエラーになるため.
      return fs.statSync(name).isFile();
    } catch(e) {
      return false;
    }
  }

  // ディレクトリチェック.
  var _isDir = function(name) {
    try {
      // try / catchで囲まないと、ディレクトリが無ければエラーになるため.
      return fs.statSync(name).isDirectory();
    } catch(e) {
      return false;
    }
  }

  // ディレクトリ作成.
  var _mkdir = function(name) {
    try {
      fs.mkdirSync(name);
      return true;
    } catch(e) {
    }
    return false;
  }

  // １つのファイル削除.
  var _removeFile = function(name) {
    try {
      fs.unlinkSync(name);
      return true;
    } catch(e) {
    }
    return false;
  }

  // １つのディレクトリを削除.
  var _removeDir = function(name) {
    try {
      fs.rmdirSync(name);
      return true;
    } catch(e) {
    }
    return false;
  }

  // ディレクトリ以下を削除処理.
  var _delete = function(name) {
    var target = null;
    var ret = false;
    var list = fs.readdirSync(name);
    for(var n in list) {
      target = name + "/" + list[n];
      if(_isFile(target)) {
        if(_removeFile(target)) {
          ret = true;
        }
      } else if(_isDir(target)) {
        if(_delete(target)) {
          ret = true;
        }
        if(_removeDir(target)) {
          ret = true;
        }
      }
    }
    return ret;
  }
  
  // フォルダが存在するかチェック.
  o.isDir = function(name) {
    return _isDir(name);
  }
  
  // ファイルが存在するかチェック.
  o.isFile = function(name) {
    return _isFile(name);
  }
  
  // ファイル読み込み.
  // UTF8でデコードでされた文字列を返却します.
  o.readByString = function(name) {
    return "" + fs.readFileSync(name);
  }
  
  // ファイル書き込み.
  o.writeByString = function(name, value) {
    fs.writeFileSync(name, value);
  }

  // ファイル削除.
  o.removeFile = function(name) {
    return _removeFile(name);
  }

  // １つのディレクトリを作成.
  o.mkdir = function(name) {
    return _mkdir(name);
  }

  // ディレクトリ群を作成.
  o.mkdirs = function(name) {
    var list = name.split("/");
    if(list.length == 0) {
      return false;
    }
    var ret = false;
    var dir = "";
    var len = list.length;
    var off = 0;
    if(list[0] == "") {
      dir = "./";
      off = 1;
    }
    for(var i = off; i < len; i ++) {
      dir += list[i] + "/";
      if(!_isDir(dir)) {
        _mkdir(dir);
        ret = true;
      }
    }
    return ret;
  }

  // ディレクトリを削除.
  o.removeDir = function(name) {
    return _removeDir(name);
  }

  // ファイル・ディレクトリを強制削除.
  // ディレクトリの場合に、配下にファイル・ディレクトリがあっても、全削除.
  o.delete = function(name) {
    if(_isFile(name)) {
      return _removeFile(name);
    } else if(_isDir(name)) {
      var ret = false;
      if(_delete(name)) {
        ret = true;
      }
      if(_removeDir(name)) {
        ret = true;
      }
      return ret;
    }
    return false;
  }

  // ディレクトリ以下の内容を取得.
  o.list = function(name) {
    return fs.readdirSync(name);
  }

  return o;
})(global);