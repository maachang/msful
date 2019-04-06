// msful用 拡張require.
//

module.exports = function (cache, backup, modules, configs) {
  'use strict';
  var CHECK_TIME = 15000;  // 15秒.
  var REMOVE_TIME = 60000; // 60秒.

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
    var ret = cache.getCache(name);
    var backupCall = backup.getCache(name);
    try {
      var stat = fs.statSync(name + ".js");
      if(stat.isDirectory()) {
        throw new Error("The file called with require is a directory:" + name);
      }
      
      // キャッシュから取得.
      var mtime = stat.mtime.getTime();
      if(ret != null && mtime == ret.lastModified) {
        return ret.value;
        
      // バックアップから取得.
      } else if(backupCall != null && mtime == backupCall.lastModified) {
        var module = {};
        backupCall.call(module);
        var ret = module.exports;
        module = null;
        return ret;
      }
      
      // 拡張require実行.
      var srcScript =
      "(function(_g) {\n" +
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
      var script = new vm.Script(srcScript, {filename: name});
      srcScript = null;
      var call = script.runInContext(context, {filename: name});
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
        cache.put(name, mtime, res);
      } else {
        // バックアップ.
        backup.put(name, mtime, call);
      }
      return res;
    } catch(e) {
      cache.remove(name);
      backup.remove(name)
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
    cache.cacheControll();
    backup.cacheControll();
    return ret;
  });
  return thisRequire;
}
