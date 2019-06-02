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
      isTraceEnabled: function() {
        _lg.isTraceEnabled();
      },
      trace: function(m, e) {
        _lg.trace(m, e);
        return this;
      },
      isDebugEnabled: function() {
        _lg.isDebugEnabled();
      },
      debug: function(m, e) {
        _lg.debug(m, e);
        return this;
      },
      isInfoEnabled: function() {
        _lg.isInfoEnabled();
      },
      info: function(m, e) {
        _lg.info(m, e);
        return this;
      },
      isWarnEnabled: function() {
        _lg.isWarnEnabled();
      },
      warn: function(m, e) {
        _lg.warn(m, e);
        return this;
      },
      isErrorEnabled: function() {
        _lg.isErrorEnabled();
      },
      error: function(m, e) {
        _lg.error(m, e);
        return this;
      },
      isFatalEnabled: function() {
        _lg.isFatalEnabled();
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
    isTraceEnabled: function() { return true; },
    trace: function(m, e) {return this;},
    isDebugEnabled: function() { return true; },
    debug: function(m, e) {return this;},
    isInfoEnabled: function() { return true; },
    info: function(m, e) {return this;},
    isWarnEnabled: function() { return true; },
    warn: function(m, e) {return this;},
    isErrorEnabled: function() { return true; },
    error: function(m, e) {return this;},
    isFatalEnabled: function() { return true; },
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