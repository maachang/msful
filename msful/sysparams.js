// システムパラメータ.
//
// 起動引数で渡されるもの.
// システムが発行するもの.
// これらの情報と、環境変数から取得されるものなど.
// 
// 他必要な情報を保持します.
//
//

module.exports.create = function(users, conf, port, timeout, env, serverId,
  contentCache, contentClose, notCache, closeFlag, systemNanoTime, debugMode) {

  // 定義.
  var constants = require("./constants");

  // スタートアップ定義.
  var _USERS = users;
  users = null;

  // confが文字列の場合は、コンフィグフォルダとして、コンフィグ情報をロード.
  // それ以外はconfオブジェクトとして、利用.
  if(typeof(conf) == "string") {
    conf = require("./conf")(conf);
  }

  // バインドポート.
  var _PORT = port;
  var _ENV_PORT = constants.ENV_BIND_PORT;

  // 通信タイムアウト.
  var _TIMEOUT = timeout;
  var _ENV_TIMEOUT = constants.ENV_TIMEOUT;

  // 実行環境.
  var _ENV = env;
  var _ENV_ENV = constants.ENV_ENV;

  // コンテンツキャッシュ.
  var _CONTENT_CACHE = contentCache;
  var _ENV_CONTENT_CACHE = constants.ENV_CONTENT_CACHE;

  // コンテンツクローズモード.
  var _CONTENT_CLOSE = contentClose;
  var _ENV_CONTENT_CLOSE = constants.ENV_CONTENT_CLOSE;

  // 通信キャッシュ.
  var _NOT_CACHE = notCache;
  var _ENV_NOT_CACHE = constants.ENV_NOT_CACHE;

  // 通信クローズ.
  var _CLOSE_FLAG = closeFlag;
  var _ENV_CLOSE_FLAG = constants.ENV_CLOSE_FLAG;

  // サーバ固有ID.
  var _SERVER_ID = serverId;

  // SystemNanoTime.
  var _SYSTEM_NANO_TIME = systemNanoTime;

  // デバッグモード.
  var _ENV_DEBUG = constants.ENV_DEBUG;
  var _DEBUG_MODE = debugMode;

  var o = {};

  // スタートアップ定義オブジェクト.
  o.getUsers = function() {
    return _USERS;
  }

  // 現状の動作条件を取得.
  o.getEnvironment = function() {
    if(!_ENV) {
      _ENV = process.env[_ENV_ENV];
      if(!_ENV) {
        // 何も設定されていない場合のデフォルト値.
        _ENV = constants.DEFAULT_ENV;
      }
    }
    return _ENV;
  }

  // バインドポートを取得.
  o.getPort = function() {
    if(!_PORT) {
      _PORT = process.env[_ENV_PORT];
      if(!_PORT) {
        // 何も設定されていない場合のデフォルト値.
        _PORT = constants.PORT;
      }
    }
    return _PORT;
  }

  // 通信タイムアウトを取得.
  o.getTimeout = function() {
    if(!_TIMEOUT) {
      _TIMEOUT = process.env[_ENV_TIMEOUT];
      if(!_TIMEOUT) {
        // 何も設定されていない場合のデフォルト値.
        _TIMEOUT = constants.TIMEOUT;
      }
    }
    return _TIMEOUT;
  }

 // コンテンツキャッシュ条件を取得.
  o.isContentCache = function() {
    if(!_CONTENT_CACHE) {
      _CONTENT_CACHE = process.env[_ENV_CONTENT_CACHE];
      if(!_CONTENT_CACHE) {
        // 何も設定されていない場合のデフォルト値.
        _CONTENT_CACHE = constants.CONTENT_CACHE;
      }
    }
    return _CONTENT_CACHE;
  }

 // コンテンツクローズ条件を取得.
 o.isContentClose = function() {
  if(!_CONTENT_CLOSE) {
    _CONTENT_CLOSE = process.env[_ENV_CONTENT_CLOSE];
    if(!_CONTENT_CLOSE) {
      // 何も設定されていない場合のデフォルト値.
      _CONTENT_CLOSE = constants.CONTENT_CLOSE;
    }
  }
  return _CONTENT_CACHE;
}

  // 通信キャッシュOffを取得.
  o.isNotCache = function() {
    if(!_NOT_CACHE) {
      _NOT_CACHE = process.env[_ENV_NOT_CACHE];
      if(!_NOT_CACHE) {
        // 何も設定されていない場合のデフォルト値.
        _NOT_CACHE = constants.NOT_CACHE;
      }
    }
    return _NOT_CACHE;
  }

  // 通信Close条件を取得.
  o.isCloseFlag = function() {
    if(!_CLOSE_FLAG) {
      _CLOSE_FLAG = process.env[_ENV_CLOSE_FLAG];
      if(!_CLOSE_FLAG) {
        // 何も設定されていない場合のデフォルト値.
        _CLOSE_FLAG = constants.CLOSE_FLAG;
      }
    }
    return _CLOSE_FLAG;
  }

  // デバッグモードを取得.
  o.getDebugMode = function() {
    if(!_DEBUG_MODE) {
      _DEBUG_MODE = process.env[_ENV_DEBUG];
      if(!_DEBUG_MODE) {
        // 何も設定されていない場合のデフォルト値.
        _DEBUG_MODE = constants.DEBUG_MODE;
      }
    }
    return _DEBUG_MODE;
  }

  // serverId固有IDを取得.
  o.getServerId = function() {
    return _SERVER_ID;
  }
  
  // systemNanoTimeを取得.
  o.getSystemNanoTime = function() {
    return _SYSTEM_NANO_TIME;
  }

  // コンフィグ情報を取得.
  o.getConfig = function() {
    return conf.getConfig();
  }

  // 現状の動作環境のコンフィグを取得.
  o.getConfigEnv = function() {
    var env = this.getEnvironment();
    var target = conf.getConfig();
    if(target[env]) {
      return target[env];
    }
    return conf;
  }

  // コンフィグデータを再読込.
  o.reloadConfig = function() {
    conf.reload();
    return conf.getConfig();
  }

  // コンフィグデータ最終読み込み時間.
  o.loadConfigTime = function() {
    return conf.getLoadTime();
  }

  return o;
}