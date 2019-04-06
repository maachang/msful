// msful 定義群.
//

module.exports = Object.freeze((function () {
  'use strict';
  
  var o = {};
  
  // バージョン.
  o.VERSION = "0.1.8";
  
  // アプリ名.
  o.NAME = "msful";
  
  // アプリ詳細名.
  o.DETAIL_NAME="micro service RESTFul API Server";
  
  // copyright.
  o.COPY_RIGHT = "Copyright(c) 2019 maachang.";
  
  // HTMLフォルダ.
  o.HTML_DIR = "./html";
  
  // APIフォルダ.
  o.API_DIR = "./api";
  
  // APIパス.
  o.API_PATH = ".";
  
  // コンフィグフォルダ.
  o.CONF_DIR = "./conf";
  
  // ライブラリフォルダ.
  o.LIB_DIR = "./lib";
  
  // デフォルトバインドポート.
  o.PORT = 3333;

  // デフォルトタイムアウト.
  o.TIMEOUT = 15000;
  
  // フィルターファイル名.
  o.FILTER_FILE = "@filter.js";

  // 未設定の実行環境.
  o.DEFAULT_ENV = "development";

  // 環境変数: ポート番号指定.
  o.ENV_BIND_PORT = "MSFUL_PORT";

  // 環境変数: タイムアウト値設定.
  o.ENV_TIMEOUT = "MSFUL_TIMEOUT";

  // 環境変数: コンテンツキャッシュ設定.
  o.ENV_CONTENT_CACHE = "MSFUL_CONTENTS_CACHE";

  // 環境変数: 実行環境設定.
  o.ENV_ENV = "MSFUL_ENV";
  
  // タイトル表示.
  o.viewTitle = function(out,enter) {
    enter = !(enter == false) ? "\n" : ""
    out(o.NAME+"(" + o.DETAIL_NAME + ") v" + o.VERSION + enter);
    out(o.COPY_RIGHT + enter);
  };
  
  return o;
})());
