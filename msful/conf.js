// config系処理系.
//

module.exports = function (baseDir) {
  'use strict';

  var constants = require("./constants");
  var file = require("../lib/file");

  // コンフィグ情報.
  var _CONFIG = null;

  // コンフィグ読み込み先フォルダ.
  if(!baseDir) {
    baseDir = constants.CONF_DIR;
  }
  var _CONFIG_DIR = baseDir;

  // コンフィグファイルを読み込み.
  var _readConfig = function(out, dir) {
  
    // コンフィグ情報を読み込む.
    // confフォルダ以下のファイルを読み込む.
    // そのときのファイル名（拡張子を除く）が
    // コンフィグ定義名となる.
    // コンフィグ内容は、JSONで定義される.
    
    // 指定フォルダが存在しない場合は読み込まない.
    if(!file.isDir(dir)) {
      return;
    }

    var n,name,p,v,sub;
    var list = file.list(dir);
    var len = list.length;
    for(var i = 0; i < len; i ++) {
      try {
        name = list[i];
        // 隠しファイルは読まない.
        if(name.indexOf(".") == 0) {
          continue;
        }
        n = dir + "/" + name;
        // ファイルの場合.
        if(file.isFile(n)) {
          v = new Function(
            "return (function(_g){\nreturn (" + _cutComment(file.readByString(n)) + ")\n})(global);"
          )();
          p = name.indexOf(".");
          if(p != -1) {
            name = name.substring(0,p);
          }
          out[name] = Object.freeze(v);
        // フォルダの場合.
        } else if(file.isDir(n)) {
          sub = {};
          out[name] = sub;
          _readConfig(sub, n)
        }
      } catch(e) {
        console.error("config error (" + n + "):" + e,e);
      }
    }
  }

  // コンフィグ情報を読み込む.
  return {
    // コンフィグ情報を取得.
    getConfig: function() {
      if(_CONFIG == null) {
        var conf = {};
        _readConfig(conf, _CONFIG_DIR);
        conf = Object.freeze(conf);
        _CONFIG = conf;
      }
      return _CONFIG;
    },
    // コンフィグ情報をリロード.
    reload: function() {
      var conf = {};
      _readConfig(conf, _CONFIG_DIR)
      conf = Object.freeze(conf);
      _CONFIG = conf;
      return conf;
    }
  };
}