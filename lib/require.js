// msful用 拡張require.
//

module.exports = function (cache, modules, createModules, configs) {
  'use strict';
  var fs,path,vm,initMod;
  var CHECK_TIME = 15000;  // 15秒.
  var REMOVE_TIME = 60000; // 60秒.
  
  // モジュールセット.
  var setModules = function(out) {
    initMod.setDefaults(out);
    for(var k in modules) {
      out[k] = modules[k];
    }
    for(var k in createModules) {
      out[k] = createModules[k];
    }
    out["config"] = configs;
    out["require"] = thisRequire;
  }
  
  // 暫く利用していないモジュールをメモリから除外.
  var checkDeleteTime = function() {
    var now = Date.now();
    if(now > cache.time + CHECK_TIME) {
      var n;
      var value = cache.cache;
      cache.time = now;
      for(var k in value) {
        n = value[k];
        if(now > n.update + REMOVE_TIME) {
          deleteCache(k);
        }
      }
    }
  }
  
  // キャッシュから除外.
  var deleteCache = function(name) {
    try {
      delete cache.cache[name];
    } catch(e){
    }
  }
  
  // 拡張require.
  var load = function(name) {
    name = path.resolve(name);
    var ret = cache.cache[name];
    try {
      var stat = fs.statSync(name + ".js");
      var mtime = stat.mtime.getTime();
      if(stat.isDirectory()) {
        throw new Error("The file called with require is a directory:" + name);
      }
      
      // キャッシュから取得.
      if(ret != undefined && mtime == ret.fileTime) {
        ret.update = Date.now();
        return ret.value;
      }
      
      // 拡張require実行.
      var srcScript = "(function(_g){\n" +
        "'use strict';\n" +
        "var exports = {};\n" +
        "var module = {\"exports\": exports};\n" +
        fs.readFileSync(name + ".js", "utf-8") + "\n" +
        "return module.exports;\n" +
        "})(global);";
      
      var memory = {};
      var context = vm.createContext(memory);
      setModules(memory);
      memory.httpError = function(status, message) {
        throw {status: status, message: message};
      };
      
      var script = new vm.Script(srcScript);
      srcScript = null;
      var res = script.runInContext(context);
      script = null;memory = null;context = null;
      
      // キャッシュにセット.
      cache.cache[name] = {value:res, update: Date.now(), fileTime:mtime};
      return res;
    } catch(e) {
      deleteCache(name);
      throw e;
    }
  }
  
  // パス指定なしの場合は通常requireで、パス指定の場合は
  // 拡張requireを呼び出す.
  var thisRequire = function(name) {
    var ret = null;
    if(name.indexOf("/") == -1) {
      ret = require(name);
    } else {
      fs = require('fs');
      path = require('path');
      vm = require('vm');
      initMod = require('./modules/init');
      ret = load(name);
    }
    checkDeleteTime();
    return ret;
  }
  return thisRequire;
}
