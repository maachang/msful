// http系処理/
//

module.exports = (function () {
  'use strict';

  var constants = require("./constants");

  // 日付情報をRFC-822に変換.
  var _toRfc822 = function (n) {
    if (typeof (n) == "number") {
      n = new Date(parseInt(n));
    }
    return n.toUTCString();
  }

  // UTF8文字列のバイナリ長を取得.
  var _utf8Length = function (n) {
    var c;
    var ret = 0;
    var len = n.length;
    for (var i = 0; i < len; i++) {
      if ((c = n.charCodeAt(i)) < 128) {
        ret++;
      } else if ((c > 127) && (c < 2048)) {
        ret += 2;
      } else {
        ret += 3;
      }
    }
    return ret;
  }
  
  // cros対応ヘッダを設定.
  var _setCrosHeader = function(headers, bodyLength, notCache, closeFlag) {
    notCache = notCache == false ? false : true;
    closeFlag = closeFlag == false ? false : true;
    var crosHeaders = "content-type";
    for(var k in headers) {
      k = k.toLowerCase();
      if(k.indexOf("x-") == 0) {
        crosHeaders += ", " + k;
      }
    }
    headers['Server'] = constants.SERVER_NAME;
    if(notCache) {
      headers['Pragma'] = 'no-cache';
    }
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Headers'] = crosHeaders + ', *';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, PUT, HEAD, PATCH, OPTIONS';
    if(closeFlag) {
      headers['Connection'] = 'close';
    }
    headers['Date'] = _toRfc822(new Date());
    headers['Content-Length'] = bodyLength;
  }

  // エラー返却処理.
  var _errorFileResult = function(status, err, res, notCache, closeFlag) {
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
    body = "{\"result\": \"error\", \"status\": " + status;
    if(err) {
      body += ", \"message\": \"" + err["message"] + "\"}";
    } else {
      body += "}";
    }

    try {
      _setCrosHeader(headers, _utf8Length(body), notCache, closeFlag);
      res.writeHead(status, headers);
      res.end(body);
    } catch(e) {
      console.debug(e);
    }
  }

   // ファイル拡張子からMimeTypeを返却.
   var _mimeType = function (name, conf) {
    var p = name.lastIndexOf(".");
    if (p == -1) {
      return "text/plain";
    }
    var n = name.substring(p + 1)
    switch (n) {
      case "htm": case "html": return "text/html; charset=utf-8;";
      case "xhtml": case "xht": return "application/xhtml+xml; charset=utf-8;";
      case "js": return "text/javascript; charset=utf-8;";
      case "css": return "text/css; charset=utf-8;";
      case "rtf": return "text/rtf";
      case "tsv": return "text/tab-separated-values";
      case "gif": return "image/gif";
      case "jpg": case "jpeg": return "image/jpeg";
      case "png": return "image/png";
      case "svg": return "image/svg+xml";
      case "rss": case "xml": case "xsl": return "application/xml";
      case "pdf": return "application/pdf";
      case "doc": return "application/msword";
      case "xls": return "application/vnd.ms-excel";
      case "ppt": return "application/vnd.ms-powerpoint";
      case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document docx";
      case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet xlsx";
      case "pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation pptx";
      case "dtd": return "application/xml-dtd";
      case "sh": return "application/x-sh";
      case "tar": return "application/x-tar";
      case "zip": return "application/zip";
      case "jar": return "application/java-archive";
      case "swf": return "application/x-shockwave-flash";
      case "mpga": case "mp2": case "mp3": return "audio/mpeg";
      case "wma": return "audio/x-ms-wma";
      case "wav": return "audio/x-wav";
      case "3gp": return "video/3gpp";
      case "3g2": return "video/3gpp2";
      case "mpeg": case "mpg": case "mpe": return "video/mpeg";
      case "qt": case "mov": return "video/quicktime";
      case "mxu": case "m4u": return "video/vnd.mpegurl";
      case "asf": case "asx": return "video/x-ms-asf";
      case "avi": return "video/x-msvideo";
      case "wmv": return "video/x-ms-wmv";
      case "flv": return "video/x-flv";
      case "ogg": return "application/ogg";
      case "mpg4": return "video/mp4";
      case "ico": return "image/x-icon";
    }

    // 追加mime条件が存在する場合.
    if(conf && conf["mime"]) {
      var ret = conf["mime"][n];
      if(ret) {
        return ""+ret;
      }
    }

    // 条件が無い場合.
    return "application/octet-stream";
  }

  // レスポンス送信.
  var _send = function(res, headers, body, status, notCache, closeFlag) {
    if((status|0) <= 0) {
      status = res.statusCode;
      if((status|0) <= 0) {
        status = 200;
      }
    }
    if(!headers) {
      headers = {};
    }
    try {
      res.statusCode = status;
      _setCrosHeader(headers, _utf8Length(body), notCache, closeFlag);

      // mimeタイプが設定されていない場合.
      if(!headers['Content-Type']) {

        // html返却として処理.
        headers['Content-Type'] = "text/html; charset=utf-8;"
      }

      // 書き込み処理.
      res.writeHead(status, headers);
      res.end(body);
      return true;
    } catch (e) {
      // エラーをデバッグ出力.
      console.debug(e);
      // レスポンスソケットクローズ.
      try {
        res.socket.destroy();
      } catch (ee) {}
      return false;
    }
  }

  // jsonレスポンス送信.
  var _sendJson = function(res, headers, body, status, notCache, closeFlag) {
    if(!headers) {
      headers = {};
    }
    headers['Content-Type'] = 'application/json; charset=utf-8;';
    return _send(res, headers, JSON.stringify(body), status, notCache, closeFlag);
  }

  // /favicon.ico を返却.
  // 404で返却します.
  var _sendFaviconIco = function(res, headers, notCache, closeFlag) {
    try {
      res.statusCode = 404;
      _setCrosHeader(headers, 0, notCache, closeFlag);
      headers['Content-Type'] = "text/html; charset=utf-8;"

      // 書き込み処理.
      res.writeHead(404, headers);
      res.end("");
      return true;
    } catch(e) {
      // エラーをデバッグ出力.
      console.debug(e);
      // レスポンスソケットクローズ.
      try {
        res.socket.destroy();
      } catch (ee) {}
    }
    return false;
  }

  var o = {};

  // レスポンス送信.
  o.send = function(res, headers, body, status, notCache, closeFlag) {
    return _send(res, headers, body, status, notCache, closeFlag);
  }

  // JSONレスポンス送信.
  o.sendJson = function(res, headers, body, status, notCache, closeFlag) {
    return _sendJson(res, headers, body, status, notCache, closeFlag);
  }

  // /facicon.icoを返却.
  // 空の404を返却する.
  o.sendFaviconIco = function(res, headers, closeFlag) {
    return _sendFaviconIco(res, headers, true, closeFlag);
  }

  // クロスヘッダを付与する.
  o.setCrosHeader = function(headers, bodyLength, notCache, closeFlag) {
    return _setCrosHeader(headers, bodyLength, notCache, closeFlag);
  }

  // エラー処理返却.
  o.errorFileResult = function(status, err, res, closeFlag) {
    _errorFileResult(status, err, res, true, closeFlag);
  }

  // mimeTypeを取得.
  o.mimeType = function (name, addMimeCall) {
    return _mimeType(name, addMimeCall);
  }

  // utf8の文字数を取得.
  o.utf8Length = function(n) {
    return _utf8Length(n);
  }

  // 日付情報をRFC-822に変換.
  o.toRfc822 = function (n) {
    return _toRfc822(n);
  }

  // if-modified-sinceがキャッシュ条件かチェック.
  // a : new Date(stat.mtime.getTime()) を設定します.
  // b : request.headers["if-modified-since"] を設定します.
  // trueの場合は、キャッシュデータ.
  o.isCache = function(a, b) {
    return parseInt(a / 1000) == parseInt(new Date(b).getTime() / 1000);
  }

  return o;
})();