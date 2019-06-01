// log出力共通.
//
//

module.exports = (function () {
  'use strict';
  var o = {};

  // ロガー.
  var _logger = {};

  // ロガーを生成.
  o.setup = function(name, logger) {
    var _lg = logger; logger = null;
    _logger[name] = {
      trace: function(m, e) {
        _lg.trace(m, e);
      },
      debug: function(m, e) {
        _lg.debug(m, e);
      },
      info: function(m, e) {
        _lg.info(m, e);
      },
      warn: function(m, e) {
        _lg.warn(m, e);
      },
      error: function(m, e) {
        _lg.error(m, e);
      },
      fatal: function(m, e) {
        _lg.fatal(m, e);
      }
    }
  }

  // ロガーを取得.
  o.get = function(name) {
    return _logger[name];
  }
  return o;
})();