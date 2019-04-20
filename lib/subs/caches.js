// ファイルキャッシュなどを取り扱う.
//

module.exports = (function(_g) {
  "use strict";

  // キャッシュ生成.
  var _create = function(cneckTime, deleteTime) {
    
    // キャッシュ管理.
    var cacheManager = {cache:{}, updateTime:Date.now()};

    // キャッシュチェック時間.
    var cacheCheckTime = 60000;  // 60秒.

    // キャッシュ削除時間.
    var cacheDeleteTime = 300000; // 300秒.
    
    cneckTime = cneckTime|0;
    deleteTime = deleteTime|0;
    if(cneckTime > 0) {
      cacheCheckTime = cneckTime;
    }
    if(deleteTime > 0) {
      cacheDeleteTime = deleteTime;
    }

    return {
      cacheManager: cacheManager,
      cacheCheckTime: cacheCheckTime,
      cacheDeleteTime: cacheDeleteTime,
      createTime: Date.now()
    }
  }

  // キャッシュコントロール : キャッシュが無効な場合は削除処理.
  var _cacheControll = function(c) {
    var ret = 0;
    var now = Date.now();
    if(now > c.cacheManager.updateTime + c.cacheCheckTime) {
      var n;
      var value = c.cacheManager.cache;
      c.cacheManager.updateTime = now;
      for(var k in value) {
        n = value[k];
        if(now > n.updateTime + c.cacheDeleteTime) {
          _remove(k);
          ret ++;
        }
        k = null;
      }
      return ret;
    }
  }

  // キャッシュセット.
  var _put = function(c, name, lastModified, call, options) {
    c.cacheManager.update = Date.now();
    var p = {
      call: call,
      lastModified: lastModified|0,
      updateTime: Date.now()
    }
    for(var k in options) {
      p[k] = options[k];
    }
    c.cacheManager.cache[name] = p;
  }

  // キャッシュ取得.
  var _getCache = function(c, name) {
    c.cacheManager.update = Date.now();
    var cache = c.cacheManager.cache[name];
    if(cache) {
      cache.updateTime = Date.now();
      return cache;
    }
    return null;
  }

  // 指定キャッシュのlastModifiedを取得.
  var _getLastModified = function(c, name) {
    c.cacheManager.update = Date.now();
    var cache = c.cacheManager.cache[name];
    if(cache) {
      cache.updateTime = Date.now();
      return cache.lastModified;
    }
    return null;
  }

  // 指定キャッシュが存在するかチェック.
  var _isCache = function(c, name) {
    return !!c.cacheManager.cache[name];
  }

  // キャッシュ削除.
  var _remove = function(c, name) {
    try {
      delete c.cacheManager.cache[name];
    } catch(e){}
  }

  return {
    create: function(cneckTime, deleteTime) {
      var _oneCache = _create(cneckTime, deleteTime);
      return {
        cacheControll: function() {
          return _cacheControll(_oneCache);
        }
        ,put: function(name, lastModified, value, options) {
          _put(_oneCache, name, lastModified, value, options);
        }
        ,execute: function(name) {
          var args = [];
          if(arguments.length > 1) {
            args = Array.prototype.slice.call(arguments, 1);
          }
          var v = _getCache(_oneCache, name);
          if(v != null) {
            v.call.apply(null, args);
          }
        }
        ,getCache: function(name) {
          return _getCache(_oneCache, name);
        }
        ,getLastModified: function(name) {
          return _getLastModified(_oneCache, name);
        }
        ,isCache: function(name) {
          return _isCache(_oneCache, name);
        }
        ,remove: function(name) {
          return _remove(_oneCache, name);
        }
      }
    }
  }
})(global);