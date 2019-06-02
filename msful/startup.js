// msful スタートアップ処理.
//

module.exports = function (_g, conf, envName, serverId) {
  'use strict';
  var _u = undefined;

  // 定義.
  var constants = require("./constants");

  // ファイルI/O.
  var file = require("../lib/file");

  // msful基本ログを取得.
  var baseLogger = require("../lib/base_logger");

  // ロガーを取得.
  var logger = msfulLogger();

  // 利用ロガーのロード.
  if(conf[constants.CONF_LOGGER_NAME] != _u) {

    // 基本ログをロードして、ロガーにセット.
    var log = null;
    var logs = baseLogger.load(conf[constants.CONF_LOGGER_NAME]);
    var len = logs.length;
    for(var i = 0; i < len; i ++) {
      log = logs[i];
      logger.setup(log.name(), log);
    }
  }

  // ユーザスタートアップのロード.
  if(file.isFile(constants.USER_STARTUP_JS)) {

    // jsファイルをロード.
    return (new Function("_g", "conf", "envName", "serverId", file.readByString(constants.USER_STARTUP_JS)))
      (_g, conf, envName, serverId);
  }

  return {};
}