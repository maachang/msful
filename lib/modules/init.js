// モジュール処理初期処理関連.
//

module.exports = (function (_g) {
  'use strict';
  var fs = require('fs');
  var o = {};
  
  // コンフィグ情報を読み込む.
  o.readConfig = function(out, dir) {
    
    // コンフィグ情報を読み込む.
    // confフォルダ以下のファイルを読み込む.
    // そのときのファイル名（拡張子を除く）が
    // コンフィグ定義名となる.
    // コンフィグ内容は、JSONで定義される.
    
    var n,name,p,v
    var list = fs.readdirSync(dir);
    var len = list.length;
    for(var i = 0; i < len; i ++) {
      try {
        name = list[i];
        n = dir + "/" + name;
        if(fs.statSync(n).isFile()) {
          v = fs.readFileSync(n);
          v = new Function(
            "return (function(_g){\n'use strict';\nreturn " + v + "\n})(global);")();
          p = name.indexOf(".");
          if(p != -1) {
            name = name.substring(0,p);
          }
          out[name] = Object.freeze(v);
        }
      } catch(e) {
        console.error("config error (" + n + "):" + e,e);
      }
    }
  }
  
  // モジュールの読み込み.
  o.loadModules = function(out, consoleFlag) {
    consoleFlag = consoleFlag == true;
    out["jwt"] = Object.freeze(require("./jwt"));
    out["strs"] = Object.freeze(require("./strs"));
    out["nums"] = Object.freeze(require("./nums"));
    out["simple"] = Object.freeze(require("./simple"));
    out["fcode"] = Object.freeze(require("./fcode"));
    
    // インスタンス生成側.
    if(!consoleFlag) {
      out["closeable"] = Object.freeze(require("./closeable"));
      out["validate"] = require("./validate").check;
    }
    out["entity"] = Object.freeze(require("./entity"));
  }
  
  // モジュール生成.
  o.createModules = function(req, res, pms, consoleFlag) {
    if(!consoleFlag) {
      require("./closeable").create();
      require("./entity").create();
    }
    require("./validate").create(req, pms);
  }
  
  // モジュールのクリア.
  o.clearModules = function() {
    require("./closeable").clear();
    require("./validate").clear();
    require("./entity").clear();
  }

  // global list.
  var _glist = [
    "Buffer",
    //"__dirname",
    //"__filename",
    "clearImmediate",
    "clearInterval",
    "clearTimeout",
    "console",
    "exports",
    "module",
    "process",
    "setImmediate",
    "setInterval",
    "setTimeout"
  ];

  // 基本モジュール群をセット
  o.setDefaults = function(out) {
    // グローバルセット.
    var len = _glist.length;
    for(var i = 0; i < len; i ++) {
      out[_glist[i]] = global[_glist[i]];
    }

    // 標準セット.
    //out["global"] = global
    out["global"] = out;
    out["srcRequire"] = require;
  }
  
  return o;
})(global)
