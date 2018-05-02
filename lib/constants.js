// msful 定義群.
//

exports.get = Object.freeze((function () {
  'use strict';
  
  var o = {};
  
  // バージョン.
  o.VERSION = "0.0.27";
  
  // アプリ名.
  o.NAME = "msful";
  
  // アプリ詳細名.
  o.DETAIL_NAME="micro service RESTFul API Server";
  
  // copyright.
  o.COPY_RIGHT = "Copyright(c) 2018 maachang.";
  
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
  
  // フィルターファイル名.
  o.FILTER_FILE = "@filter.js";
  
  // タイトル表示.
  o.viewTitle = function(out,enter) {
    enter = !(enter == false) ? "\n" : ""
    out(o.NAME+"(" + o.DETAIL_NAME + ") v" + o.VERSION + enter);
    out(o.COPY_RIGHT + enter);
  };
  
  return o;
})());
