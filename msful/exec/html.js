// htmlコンテンツ系実行処理.
//
//

module.exports.create = function (_g, core) {
  'use strict';
  var _u = undefined
  var fs = require('fs');
  var path = require('path');
  var constants = require("../constants");
  var file = require("../../lib/file");

  // httpCore処理.
  var httpCore = require('../http_core');

  // sysParams.
  var sysParams = core.getSysParams();
  var configEnv = sysParams.getConfigEnv()
  var notCache = sysParams.isNotCache();
  var closeFlag = sysParams.isCloseFlag();
  var contentCache = sysParams.isContentCache();

  // システムロガー.
  var log = msfulLogger().get("system");

  // 基本htmlパス.
  var baseHtmlPath = path.resolve(constants.HTML_DIR);

  // ファイル読み込み.
  var readFile = function (req, res, url) {
    if (url.lastIndexOf("/") == url.length - 1) {
      url += "index.html";
    }
    var name = constants.HTML_DIR + url;
    var mime = httpCore.mimeType(url, configEnv);
    var headers = {
      'Server': constants.SERVER_NAME,
      'Content-Type': mime
    };
    if((mime.indexOf("text/") != -1 || mime.indexOf("xml") != -1) &&
      req.headers["accept-encoding"] && req.headers["accept-encoding"].indexOf("gzip") != -1) {
      if(file.isFile(name + ".gz")) {
        headers["Content-Encoding"] = "gzip";
        readTargetFile(req, res, name + ".gz", headers);
      } else {
        readTargetFile(req, res, name, headers);
      }
    } else {
      readTargetFile(req, res, name, headers);
    }
  }

  // 指定１ファイル読み込み.
  var readTargetFile = function(req, res, name, appendHeaders) {
    var stat = file.stat(name);
    if(stat == null) {
      errorFileResult(404, null, res, req);
      return;
    }
    try {
      var status = 200;
      var headers = {};
      var body = "";
      var bodyLength = 0;
      // フォルダアクセスの場合は403返却.
      if(stat.isDirectory()) {
        errorFileResult(403, null, res, req);
        return;
      }
      var mtime = stat.mtime.getTime();
      headers['Last-Modified'] = httpCore.toRfc822(new Date(mtime));
      if(appendHeaders != null) {
        for(var k in appendHeaders) {
          headers[k] = appendHeaders[k];
        }
      }
      // リクエストヘッダを見て、If-Modified-Sinceと、ファイル日付を比較.
      if (req.headers["if-modified-since"] != _u) {
        if (contentCache && httpCore.isCache(mtime, req.headers["if-modified-since"])) {
          
          // キャッシュの場合.
          status = 304;
          
          // 返却処理.
          try {
            // クロスヘッダ対応. 
            httpCore.setCrosHeader(headers, bodyLength, notCache, closeFlag);
            res.writeHead(status, headers);
            res.end(body);
          } catch(e) {
            log.debug("exception", e);
          }
          return;
        }
      }
      
      // 返却処理.
      try {
        // ファイル情報は非同期で読む(クロスヘッダ対応).
        httpCore.setCrosHeader(headers, stat.size, notCache, closeFlag);
        res.writeHead(status, headers);
        var readableStream = fs.createReadStream(name);
        readableStream.on('data', function (data) {
          res.write(data);
        });
        readableStream.on('end', function () {
          res.end();
        });
      } catch(e) {
        log.debug("exception", e);
      }
    } catch (e) {
      // それ以外のエラー.
      errorFileResult(500, e, res, req);
    }
  }

  // 静的ファイル用エラー返却処理.
  var errorFileResult = function(status, err, res, req) {
    status = status|0;
    if(status <= 0) {
      status = 500;
    }
    var headers = {};
    var body = "";
    var message = (err && err['message']) ? err['message'] : httpCore.getMessage(status);
    if(status >= 500) {
      if(log.isErrorEnabled()) {
        if(err) {
          log.error("status: " + status + " message: " + message,
            "[" + httpCore.getIp(req) + "]", err);
        } else {
          log.error("statis: " + status + " message: " + message,
            "[" + httpCore.getIp(req) + "]");
        }
      }
    }
    // error 404 と 500 の場合は、メッセージを書き換える.
    if(status == 404 || status == 500) {
      message = httpCore.getMessage(status);
    }
    // 静的ファイルでも、JSONエラーを返却させる.
    headers['Content-Type'] = "text/javascript; charset=utf-8;";
    headers['Pragma'] = 'no-cache';
    body = "{\"result\": \"error\", \"status\": " + status;
    if(message) {
      body += ", \"message\": \"" + message + "\"}";
    } else {
      body += "}";
    }
    try {
      // クロスヘッダ対応.
      httpCore.setCrosHeader(headers, httpCore.utf8Length(body), notCache, closeFlag);
      res.writeHead(status, headers);
      res.end(body);
    } catch(e) {
      log.debug("exception", e);
    }
  }

  var o = {};

  // 実行処理.
  var _exec = function(req, res, url) {
    setImmediate(function() {
      var rq = req;
      var rs = res;
      var u = url;
      try {
        readFile(rq, rs, u);
      } catch(e) {
        errorFileResult(500, e, rs, rq);
      }
    });
  }

  // HTML実行.
  o.execute = function(req, res, url) {

    // アクセス禁止URL.
    if (url.indexOf(constants.FORBIDDEN_URL) != -1) {
      // アクセス禁止.
      errorFileResult(403, null, res, req);
    }
    
    // 静的ファイルパスチェック.
    else if(!httpCore.checkPath(constants.HTML_DIR, baseHtmlPath, url, res)) {
      // アクセス禁止.
      errorFileResult(403, null, res, req);
    }
    // 実行処理.
    else {
      // ファイル返却.
      _exec(req, res, url);
    }
  }

  return o;
}
