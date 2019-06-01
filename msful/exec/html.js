// htmlコンテンツ系実行処理.
//
//

module.exports.create = function (core, notCache, closeFlag) {
  'use strict';
  var _u = undefined
  var fs = require('fs');
  var path = require('path');
  var constants = require("../constants");

  // httpCore処理.
  var httpCore = require('../http_core');

  // sysParams.
  var sysParams = core.getSysParams();

  // 基本htmlパス.
  var baseHtmlPath = path.resolve(constants.HTML_DIR);

  // ファイル読み込み.
  var readFile = function (req, res, url) {
    if (url.lastIndexOf("/") == url.length - 1) {
      url += "index.html";
    }
    var name = constants.HTML_DIR + url;
    var mime = httpCore.mimeType(url, sysParams.getConfigEnv());
    var headers = { 'Server': constants.SERVER_NAME, 'Content-Type': mime };
    if((mime.indexOf("text/") != -1 || mime.indexOf("xml") != -1) &&
      req.headers["accept-encoding"] && req.headers["accept-encoding"].indexOf("gzip") != -1) {
      headers["Content-Encoding"] = "gzip";
      readTargetFile(req, res, name + ".gz", headers, function(errorState, errorFileName, e) {
        if(errorState == 404) {
          delete headers["Content-Encoding"]
          readTargetFile(req, res, name, headers, function(errorState, errorFileName, e) {
            errorFileResult(errorState, e, res);
          });
        } else {
          errorFileResult(errorState, e, res);
        }
      });
    } else {
      readTargetFile(req, res, name, headers, function(errorState, errorFileName, e) {
        errorFileResult(errorState, e, res);
      });
    }
  }

  // 指定１ファイル読み込み.
  var readTargetFile = function(req, res, name, appendHeaders, errorCall) {
    fs.stat(name, function (err, stat) {
      try {
        if (err) throw err;
        var status = 200;
        var headers = {};
        var body = "";
        var bodyLength = 0;
        // フォルダアクセスの場合は403返却.
        if(stat.isDirectory()) {
          errorFileResult(403, null, res);
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
          if (sysParams.isContentCache() && httpCore.isCache(mtime, req.headers["if-modified-since"])) {
            
            // キャッシュの場合.
            status = 304;
            
            // 返却処理.
            try {
              // クロスヘッダ対応. 
              httpCore.setCrosHeader(headers, bodyLength, notCache, closeFlag);
              res.writeHead(status, headers);
              res.end(body);
            } catch(e) {
              console.debug(e);
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
          console.debug(e);
        }
      } catch (e) {
        errorCall((e.code && e.code == 'ENOENT') ? 404 : 500, name, e);
      }
    });
  }

  // 静的ファイル用エラー返却処理.
  var errorFileResult = function(status, err, res) {
    var headers = {};
    var body = "";
    if (status >= 500) {
      if(err != null) {
        console.error(err + " status:" + status, err);
      } else {
        console.error("error: " + status);
      }
    }
    // 静的ファイルでも、JSONエラーを返却させる.
    headers['Content-Type'] = "text/javascript; charset=utf-8;";
    headers['Pragma'] = 'no-cache';
    body = "{\"result\": \"error\", \"status\": " + status;
    if(err) {
      body += ", \"message\": \"" + err["message"] + "\"}";
    } else {
      body += "}";
    }
    try {
      // クロスヘッダ対応.
      httpCore.setCrosHeader(headers, httpCore.utf8Length(body), notCache, closeFlag);
      res.writeHead(status, headers);
      res.end(body);
    } catch(e) {
      console.debug(e);
    }
  }

  var o = {};

  // 実行処理.
  var _exec = async function(req, res, url) {
    setImmediate(function() {
      var rq = req; req = null;
      var rs = res; res = null;
      var u = url; url = null;
      try {
        readFile(rq, rs, u);
      } catch(e) {
        errorFileResult(500, e, rs);
      }
    });
  }

  // HTML実行.
  o.execute = function(req, res, url) {

    // アクセス禁止URL.
    if (url.indexOf(constants.FORBIDDEN_URL) != -1) {
      // アクセス禁止.
      errorFileResult(403, null, res);
      return false;
    }
    
    // 静的ファイルパスチェック.
    if(!httpCore.checkPath(constants.HTML_DIR, baseHtmlPath, url, res)) {
      // アクセス禁止.
      errorFileResult(403, null, res);
      return false;
    }
    
    // ファイル返却.
    _exec(req, res, url);
    return true;
  }

  return o;
}
