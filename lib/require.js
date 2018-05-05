// msful用 拡張require.
//

module.exports = function (cache, backup, modules, configs) {
  'use strict';
  var CHECK_TIME = 15000;  // 15秒.
  var REMOVE_TIME = 60000; // 60秒.
  
  // 暫く利用していないモジュールをメモリから除外.
  var checkDeleteTime = function() {
    var now = Date.now();
    if(now > cache.time + CHECK_TIME ||
      now > backup.time + CHECK_TIME) {
      var n, k;
      var value = cache.cache;
      cache.time = backup.time = now;
      for(k in value) {
        n = value[k];
        if(now > n.update + REMOVE_TIME) {
          deleteCache(k);
        }
      }
      value = backup.cache;
      for(k in value) {
        n = value[k];
        if(now > n.update + REMOVE_TIME) {
          deleteBackup(k);
        }
      }
    }
  }
  
  // キャッシュから除外.
  var deleteCache = function(name) {
    try {
      delete cache.cache[name];
    } catch(e){}
  }
  
  // バックアップから除外.
  var deleteBackup = function(name) {
    try {
      delete backup.cache[name];
    } catch(e){}
  }
  
  // モジュールセット.
  var setModules = function(out, mod) {
    mod.setDefaults(out);
    for(var k in modules) {
      out[k] = modules[k];
    }
    out["config"] = configs;
    out["require"] = thisRequire;
  }
  
  // 拡張require.
  var load = function(name, fs, path, vm, mod) {
    name = path.resolve(name);
    var ret = cache.cache[name];
    var backupCall = backup.cache[name];
    try {
      var stat = fs.statSync(name + ".js");
      if(stat.isDirectory()) {
        throw new Error("The file called with require is a directory:" + name);
      }
      
      // キャッシュから取得.
      var mtime = stat.mtime.getTime();
      if(ret != undefined && mtime == ret.fileTime) {
        ret.update = Date.now();
        return ret.value;
        
      // バックアップから取得.
      } else if(backupCall != undefined && mtime == backupCall.fileTime) {
        backupCall.update = Date.now();
        var module = {};
        backupCall.call(module);
        var ret = module.exports;
        module = null;
        return ret;
      }
      
      // 拡張require実行.
      var srcScript = "(function(_g) {\n" +
        "'use strict';\n" +
        "return function(module){\n" +
        "var exports = {};\n" +
        "module.exports = exports;\n" +
        fs.readFileSync(name + ".js", "utf-8") + "\n" +
        "};\n})(global);";
      
      var memory = {};
      var context = vm.createContext(memory);
      setModules(memory, mod);
      memory.httpError = function(status, message) {
        throw {status: status, message: message};
      };
      memory["#require#cache"] = true;
      memory.requireCache = function(v) {
        memory["#require#cache"] = v;
      };
      
      // 読み込んだモジュールを実行.
      var script = new vm.Script(srcScript);
      srcScript = null;
      var call = script.runInContext(context);
      var cacheFlag = !(memory["#require#cache"] == false);
      script = null;context = null;
      
      // モジュール生成.
      var module = {};
      call(module);
      var res = module.exports;
      module = null;
      
      if (cacheFlag) {
        // 戻り値が存在しない場合は、キャッシュさせない.
        // 変わりに作成メソッドをバックアップ.
        if (res == undefined || res == null ||
          (typeof(res) == "object" && Object.keys(res).length) == 0) {
          cacheFlag = false;
        }
      }
      
      // キャッシュにセット.
      if (cacheFlag) {
        // キャッシュ.
        cache.cache[name] = {value: res, update: Date.now(), fileTime: mtime};
      } else {
        // バックアップ.
        backup.cache[name] = {call: call, update: Date.now(), fileTime: mtime};
      }
      return res;
    } catch(e) {
      deleteCache(name);
      deleteBackup(name);
      throw e;
    }
  }
  
  // パス指定なしの場合は通常requireで、パス指定の場合は
  // 拡張requireを呼び出す.
  var thisRequire = Object.freeze(function(name) {
    var ret = null;
    if(name.indexOf("/") == -1) {
      ret = require(name);
    } else {
      var fs = require('fs');
      var path = require('path');
      var vm = require('vm');
      var mod = require('./modules/init');
      ret = load(name, fs, path, vm, mod);
    }
    checkDeleteTime();
    return ret;
  });
  return thisRequire;
}
