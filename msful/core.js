// msful コア情報.
//

module.exports = (function (_g) {
  'use strict';
  
  var file = require("../lib/file");
  var o = {};

  // モジュール情報.
  var modules = {};

  // システムパラメータ.
  var sysParams = null;

  // システムパラメータを設定.
  o.setSysParams = function(p) {
    sysParams = p;
  }

  // システムパラメータを取得.
  o.getSysParams = function() {
    return sysParams;
  }
  
  // モジュールの読み込み.
  o.loadModules = function(consoleFlag) {
    consoleFlag = consoleFlag == true;
    modules["file"] = Object.freeze(file);
    modules["psync"] = Object.freeze(require("../lib/psync")(sysParams.getSystemNanoTime()));
    modules["jwt"] = Object.freeze(require("../lib/jwt"));
    modules["strs"] = Object.freeze(require("../lib/strs"));
    modules["nums"] = Object.freeze(require("../lib/nums"));
    modules["fcomp"] = Object.freeze(require("../lib/fcomp"));
    modules["fcipher"] = Object.freeze(require("../lib/fcipher"));
    modules["uniqueId"] = Object.freeze(require("../lib/uniqueId"));
    modules["httpClient"] = Object.freeze(require("../lib/http_client")); 
    
    // インスタンス生成側.
    if(!consoleFlag) {
      modules["closeable"] = Object.freeze(require("../lib/closeable"));
      modules["validate"] = require("../lib/validate").check;
    }
    modules["entity"] = Object.freeze(require("../lib/entity"));

    // argsCmd.getParams だけを抽出する.
    modules["argsCmd"] = Object.freeze({"getParams": require("../lib/subs/args").getParams});
  }
  
  // モジュール生成.
  o.createModules = function(req, res, pms, consoleFlag) {
    if(!consoleFlag) {
      require("../lib/closeable").create();
      require("../lib/entity").create();
    }
    require("../lib/validate").create(req, pms);
  }
  
  // モジュールのクリア.
  o.clearModules = function() {
    require("../lib/closeable").clear();
    require("../lib/validate").clear();
    require("../lib/entity").clear();
  }

  // モジュールリセット.
  o.resetModules = function() {
    modules = {};
  }

  // モジュールを取得.
  o.getModules = function() {
    return modules;
  }

  // グローバルメモリにmsful固有の条件を設定します.
  o.setMsfulGlobals = function(out) {
    out["config"] = Object.freeze(sysParams.getConfig());
    out["envConf"] = Object.freeze(sysParams.getConfigEnv());
    out["reloadConf"] = Object.freeze(sysParams.reloadConfig);
    out["loadConfTime"] = Object.freeze(sysParams.loadConfigTime);

    out["msfulEnv"] = Object.freeze(sysParams.getEnvironment());
    out["msfulDebug"] = Object.freeze(sysParams.getDebugMode());
    out["serverId"] = Object.freeze(sysParams.getServerId());
    out["systemNanoTime"] = Object.freeze(sysParams.getSystemNanoTime());
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
  o.setDefaultModules = function(out) {
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
