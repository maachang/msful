// モジュール処理初期処理関連.
//

module.exports = (function (_g) {
  'use strict';
  var fs = require('fs');
  var constants = require("../constants");
  var o = {};

  // 実行環境.
  var env = null;

  // javascript正規表現かチェック.
  // str : チェック対象の文字列を設定します.
  // p : チェック開始位置を設定します.
  // len : チェックする長さを設定します.
  // 戻り値 : -1の場合は、正規表現ではありません.
  var _checkRegExp = function( str,p,len ) {
    if( p+1 >= len ) {
      return -1 ;
    }
    var c = str.charAt( p+1 ) ;
    if( c == '/' || c == '*' ) {
      return -1 ;
    }
    for( var i = p+1,b = -1 ; i < len ; i ++ ) {
      c = str.charAt( i ) ;
      if( c == ' ' || c == '\t' || c == '\r' || c == '\n' ) {
        return -1 ;
      }
      else if( c == '/' && b == '\\' ) {
        b = -1 ;
        continue ;
      }
      else if( b == '/' ) {
        if( c == 'i' || c == 'g' || c == 'm' ) {
          return i ;
        }
        else {
          return i-1 ;
        }
      }
      b = c ;
    }
    return -1 ;
  }

  // コメント情報の削除.
  var _cutComment = function(script) {
    if(script == null || script.length <= 0) {
      return "";
    }
    script = "" + script;
    var buf = "";
    var len = script.length;
    var cote = -1;
    var commentType = -1;
    var bef = -1;
    var c,c2,p ;
    var yen = "\\".charAt( 0 );
    for( var i = 0 ; i < len ; i ++ ) {
      if( i != 0 ) {
        bef = script.charAt( i-1 );
      }
      c = script.charAt(i);
      // コメント内の処理.
      if( commentType != -1 ) {
        switch( commentType ) {
          case 1 : // １行コメント.
            if( c == '\n' ) {
              buf = buf + c;
              commentType = -1 ;
            }
            break;
          case 2 : // 複数行コメント.
            if( c == '\n' ) {
              buf = buf + c;
            }
            else if( len > i + 1 && c == '*' && script.charAt( i+1 ) == '/' ) {
              i ++;
              commentType = -1;
            }
            break;
          }
          continue;
      }
      // シングル／ダブルコーテーション内の処理.
      if( cote != -1 ) {
        if( c == cote && bef != yen ) {
          cote = -1;
        }
        buf = buf + c;
        continue;
      }
      // それ以外の処理.
      if( c == '/' ) {
        // Javascriptの正規表現の場合は処理しない.
        if( ( p = _checkRegExp( script,i,len ) ) != -1 ) {
          buf = buf + script.substring( i,p+1 );
          i = p;
          continue;
        }
        if( len <= i + 1 ) {
          buf = buf + c;
          continue;
        }
        c2 = script.charAt( i+1 );
        if( c2 == '*' ) {
          commentType = 2;
          continue;
        }
        else if( c2 == '/' ) {
          commentType = 1;
          continue;
        }
      }
      // コーテーション開始.
      else if( ( c == '\'' || c == '\"' ) && bef != yen ) {
        cote = c & 0x0000ffff;
      }
      buf = buf + c;
    }
    return buf;
  }

  // 実行環境をセット.
  o.setEnvironment = function(e) {
    if(!e) {
      e = process.env[constants.ENV_ENV];
      if(!e) {
        e = constants.DEFAULT_ENV;
      }
    } else {
      e = constants.DEFAULT_ENV;
    }
    env = e;
  }
  
  // 現状の動作条件を取得.
  o.getEnvironment = function() {
    return env;
  }
  
  // コンフィグ情報を読み込む.
  o.readConfig = function(out, dir) {
    
    // コンフィグ情報を読み込む.
    // confフォルダ以下のファイルを読み込む.
    // そのときのファイル名（拡張子を除く）が
    // コンフィグ定義名となる.
    // コンフィグ内容は、JSONで定義される.
    
    var n,name,p,v,sub;
    var list = fs.readdirSync(dir);
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
        if(fs.statSync(n).isFile()) {
          v = new Function(
            "return (function(_g){\n'use strict';\nreturn (" + _cutComment(fs.readFileSync(n)) + ")\n})(global);")();
          p = name.indexOf(".");
          if(p != -1) {
            name = name.substring(0,p);
          }
          out[name] = Object.freeze(v);
        // フォルダの場合.
        } else if(fs.statSync(n).isDirectory()) {
          sub = {};
          out[name] = sub;
          o.readConfig(sub, n)
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
    out["fcomp"] = Object.freeze(require("./fcomp"));
    out["fcipher"] = Object.freeze(require("./fcipher"));
    
    // インスタンス生成側.
    if(!consoleFlag) {
      out["closeable"] = Object.freeze(require("./closeable"));
      out["validate"] = require("./validate").check;
    }
    out["entity"] = Object.freeze(require("./entity"));
  }
  
  // モジュール生成.
  o.createModules = function(req, res, pms, consoleFlag, env) {
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
