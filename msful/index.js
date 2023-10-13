// micro service RESTful.
//
//

module.exports.create = function (
  _g, users, conf, port, timeout, contentsCacheMode,
  contentsClose, args_env, msfulId, systemNanoTime) {
  'use strict';
  var http = require('http');
  var constants = require("./constants");
  var core = require("./core");

  // httpCore.
  var httpCore = require("./http_core");

  // 正しいURLを取得.
  var getUrl = function (req) {
    var u = req.url;
    var p = u.indexOf("?");
    if (p == -1) {
      return u;
    }
    return u.substring(0, p);
  }

  // プロセス例外ハンドラ.
  process.on('uncaughtException', function(e) {
    console.trace("error uncaughtException", e);
  });

  // promise例外ハンドラ.
  process.on('unhandledRejection', function(reason) {
    console.trace("error unhandledRejection", reason);
  });

  // システムパラメータを生成.
  var sysParams = require("./sysparams");
  sysParams = sysParams.create(
    users, conf,
    port, timeout, args_env, msfulId,
    contentsCacheMode, contentsClose, null, null, 
    systemNanoTime, null
  )

  // システムパラメータを設定.
  core.setSysParams(sysParams);

  // デフォルトのモジュールを読み込む.
  core.resetModules();
  core.loadModules();

  // exec系の展開.
  var execApi = require("./exec/api").create(_g, core);
  var execHtml = require("./exec/html").create(_g, core);

  // HTTP実行.
  var execute = function(req, res, data) {
    // URLを取得.
    var url = getUrl(req);
    
    // APIアクセス.
    if (url.indexOf(constants.URL_API_PATH) == 0) {
      execApi.execute(req, res, url, data);
    // コンテンツアクセス.
    } else {
      execHtml.execute(req, res, url);
    }
  }

  // サーバー生成.
  var server = http.createServer(function (req, res) {
    httpCore.request(req, res, execute);
  });
  
  // タイムアウトセット.
  server.setTimeout(sysParams.getTimeout());

  // キープアライブタイムアウトをセット.
  server.keepAliveTimeout = 2500;

  // maxHeadersCountはゼロにセット.
  server.maxHeadersCount = 0;

  // http.socketオプションを設定.
  server.on("connection", function(socket) {
    socket.setNoDelay(true);
    socket.setKeepAlive(false, 0);
  });

  // 指定ポートで待つ.
  // ipv4設定(node17からBIND先のIPアドレス設定してない場合はipv6となるので0.0.0.0でBIND).
  server.listen(sysParams.getPort(), "0.0.0.0");

  // 起動結果をログ出力.
  console.info("## listen: " + sysParams.getPort() +
    " env:[" + sysParams.getEnvironment() +
    "] timeout:" + (sysParams.getTimeout() / 1000) +
    "(sec) contentCache:" + sysParams.isContentCache() +
    " pid:" + process.pid);
  
  server = null;
}
