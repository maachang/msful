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
        return _lg.isTraceEnabled();
      },
      trace: function() {
        _lg.trace.apply(null, arguments)
        return this;
      },
      isDebugEnabled: function() {
        return _lg.isDebugEnabled();
      },
      debug: function() {
        _lg.debug.apply(null, arguments)
        return this;
      },
      isInfoEnabled: function() {
        return _lg.isInfoEnabled();
      },
      info: function() {
        _lg.info.apply(null, arguments)
        return this;
      },
      isWarnEnabled: function() {
        return _lg.isWarnEnabled();
      },
      warn: function() {
        _lg.warn.apply(null, arguments)
        return this;
      },
      isErrorEnabled: function() {
        return _lg.isErrorEnabled();
      },
      error: function() {
        _lg.error.apply(null, arguments)
        return this;
      },
      isFatalEnabled: function() {
        return _lg.isFatalEnabled();
      },
      fatal: function() {
        _lg.fatal.apply(null, arguments)
        return this;
      }
    }
    // 最初に登録したロガー名を保持.
    _baseLoggerName = (!_baseLoggerName) ? name : _baseLoggerName;
  }

  // 空のロガー.
  var _BLANK = Object.freeze({
    isTraceEnabled: function() { return true; },
    trace: function() {return this;},
    isDebugEnabled: function() { return true; },
    debug: function() {return this;},
    isInfoEnabled: function() { return true; },
    info: function() {return this;},
    isWarnEnabled: function() { return true; },
    warn: function() {return this;},
    isErrorEnabled: function() { return true; },
    error: function() {return this;},
    isFatalEnabled: function() { return true; },
    fatal: function() {return this;}
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