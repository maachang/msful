// msful 定義群.
//

module.exports = Object.freeze((function () {
  'use strict';
  
  // package.json.
  const pkg = require("../package.json");

  var o = {};
  
  // バージョン.
  o.VERSION = pkg.version;
  
  // アプリ名.
  o.NAME = pkg.name;
  
  // アプリ詳細名.
  o.DETAIL_NAME = pkg.dependencies;
  
  // copyright.
  o.COPY_RIGHT = pkg.copyright;
  
  // HTMLフォルダ.
  o.HTML_DIR = "./html";
  
  // APIフォルダ.
  o.API_DIR = "./api";

  // URL APIパス.
  o.URL_API_PATH = "/api/";

  // URL HTMLパス
  o.URL_HTML_PATH = "/html/";
  
  // APIパス.
  o.API_PATH = ".";
  
  // コンフィグフォルダ.
  o.CONF_DIR = "./conf";
  
  // ライブラリフォルダ.
  o.LIB_DIR = "./lib";

  // ログフォルダ.
  o.LOG_DIR = "./log";

  // フィルターファイル名.
  o.FILTER_FILE = "@filter.js";

  // 禁止パス.
  o.FORBIDDEN_URL = "/@";

  // スタートアップ用スクリプト.
  o.STARTUP_SCRIPT = "./startup.js"
  
  // デフォルト: バインドポート.
  o.PORT = 3333;

  // デフォルト: タイムアウト.
  o.TIMEOUT = 15000;

  // デフォルト: コンテンツキャッシュ.
  o.CONTENT_CACHE = true;

  // デフォルト: コンテンツクローズモード.
  o.CONTENT_CLOSE = false;

  // デフォルト: WebAPIキャッシュ.
  o.NOT_CACHE = true;

  // デフォルト: WebAPIクローズモード.
  o.CLOSE_MODE = true;

  // デフォルト: デバッグモード.
  o.DEBUG_MODE = false;

  // デフォルト: 未設定の実行環境.
  o.DEFAULT_ENV = "development";
  

  // 環境変数: ポート番号指定.
  o.ENV_BIND_PORT = "MSFUL_PORT";

  // 環境変数: タイムアウト値設定.
  o.ENV_TIMEOUT = "MSFUL_TIMEOUT";

  // 環境変数: コンテンツキャッシュ設定.
  o.ENV_CONTENT_CACHE = "MSFUL_CONTENTS_CACHE";

  // 環境変数: コンテンツクローズモード.
  o.ENV_CONTENT_CLOSE = "MSFUL_CONTENTS_CLOSE";

  // 環境変数: 実行環境設定.
  o.ENV_ENV = "MSFUL_ENV";

  // 環境変数: クラスタサイズ設定.
  o.ENV_CLUSTER = "MSFUL_CLUSTER";

  // 環境変数: デバッグモード.
  o.ENV_DEBUG = "MSFUL_DEBUG";

  // 環境変数: WebAPIキャッシュモード.
  o.ENV_NOT_CACHE = "MSFUL_NOT_CACHE";

  // 環境変数: WebAPIクローズモード.
  o.ENV_CLOSE_FLAG = "MSFUL_CLOSE_FLAG";


  // コンフィグ: ロガー用コンフィグ.
  o.CONF_LOGGER_NAME = "logConf";

  // ユーザスタートアップファイル名.
  o.USER_STARTUP_FILE = "startup.js";

  // ユーザスタートアップ定義.
  o.USER_STARTUP_JS = "./" + o.USER_STARTUP_FILE;
  
  // タイトル表示.
  o.viewTitle = function(out,enter) {
    enter = !(enter == false) ? "\n" : ""
    out(o.NAME+"(" + o.DETAIL_NAME + ") v" + o.VERSION + enter);
    out(o.COPY_RIGHT + enter);
  };
  
  return o;
})());
