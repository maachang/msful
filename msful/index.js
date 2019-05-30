// micro service RESTful.
//
//

module.exports.create = function (port, timeout, contentsCacheMode, args_env, msfulId, systemNanoTime) {
  'use strict';
  var http = require('http');
  var constants = require("./constants");
  var core = require("./core");

  // httpCore.
  var httpCore = require("./http_core");

  // exec系.
  var execApi = require("./exec/api");
  var execHtml = require("./exec/html");

  // 正しいURLを取得.
  var getUrl = function (req) {
    var u = req.url;
    var p = u.indexOf("?");
    if (p == -1) {
      return u;
    }
    return u.substring(0, p);
  }

  // HTTP実行.
  var execute = async function(req, res, data) {
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

  // httpサーバ生成.
  var createHttp = function (call) {
    return http.createServer(function (req, res) {
      var c = call; call = null;
      httpCore.request(req, res, c);
    })
  }

  // プロセス例外ハンドラ.
  process.on('uncaughtException', function(e) {
    console.trace(e);
  });

  // promise例外ハンドラ.
  process.on('unhandledRejection', (reason) => {
    console.trace(reason);
  });

  // システムパラメータを生成.
  var sysParams = require("./sysparams");
  sysParams = sysParams.create(
    constants.CONF_DIR,
    port, timeout, args_env, msfulId,
    contentsCacheMode, null, null, null, 
    systemNanoTime, null
  )

  // システムパラメータを設定.
  core.setSysParams(sysParams);

  // デフォルトのモジュールを読み込む.
  core.resetModules();
  core.loadModules();

  // exec系の展開.
  execApi = execApi.create(core, sysParams.isNotCache(), sysParams.isCloseFlag());
  execHtml = execHtml.create(core, sysParams.isNotCache(), sysParams.isCloseFlag());

  // サーバー生成.
  var server = createHttp(execute);
  
  // タイムアウトセット.
  server.setTimeout(sysParams.getTimeout());

  // 指定ポートで待つ.
  server.listen(sysParams.getPort());

  // 起動結果をログ出力.
  console.info("## listen: " + sysParams.getPort() +
    " env:[" + sysParams.getEnvironment() +
    "] timeout:" + (sysParams.getTimeout() / 1000) +
    "(sec) contentCache:" + sysParams.isContentCache() +
    " pid:" + process.pid);
  
  server = null;
}
