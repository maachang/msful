// log出力共通.
//
//

module.exports = (function () {
  'use strict';
  var o = {};

  // ロガー.
  var _logger = {};

  // 先頭のロガー名.
  var _baseLoggerName = null;

  // ロガーを生成.
  o.setup = function(name, logger) {
    if(!name || !logger) {
      return;
    }
    var _lg = logger; logger = null;
    _logger[name] = {
      isTrace: function() {
        _lg.isTrace();
      },
      trace: function(m, e) {
        _lg.trace(m, e);
        return this;
      },
      isDebug: function() {
        _lg.isDebug();
      },
      debug: function(m, e) {
        _lg.debug(m, e);
        return this;
      },
      isInfo: function() {
        _lg.isInfo();
      },
      info: function(m, e) {
        _lg.info(m, e);
        return this;
      },
      isWarn: function() {
        _lg.isWarn();
      },
      warn: function(m, e) {
        _lg.warn(m, e);
        return this;
      },
      isError: function() {
        _lg.isError();
      },
      error: function(m, e) {
        _lg.error(m, e);
        return this;
      },
      isFatal: function() {
        _lg.isFatal();
      },
      fatal: function(m, e) {
        _lg.fatal(m, e);
        return this;
      }
    }
    // 最初に登録したロガー名を保持.
    _baseLoggerName = (!_baseLoggerName) ? name : _baseLoggerName;
  }

  // 空のロガー.
  var _BLANK = Object.freeze({
    isTrace: function() { return true; },
    trace: function(m, e) {return this;},
    isDebug: function() { return true; },
    debug: function(m, e) {return this;},
    isInfo: function() { return true; },
    info: function(m, e) {return this;},
    isWarn: function() { return true; },
    warn: function(m, e) {return this;},
    isError: function() { return true; },
    error: function(m, e) {return this;},
    isFatal: function() { return true; },
    fatal: function(m, e) {return this;}
  });

  // ロガーを取得.
  o.get = function(name) {
    if(!name) {
      name = _baseLoggerName;
    }
    // 取得するロガーが存在しない場合は、空のロガーを返却.
    var ret = _logger[name];
    if(!ret) {
      ret = _BLANK;
    }
    return ret;
  }

  // 登録数を取得.
  o.size = function() {
    var ret = 0;
    for(var k in _logger) {
      ret ++;
    }
    return ret;
  }

  // 登録名一覧を取得.
  o.names = function() {
    var ret = [];
    for(var k in _logger) {
      ret.push(k);
    }
    return ret;
  }

  return o;
})();