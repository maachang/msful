// http系処理.
//

module.exports = (function () {
  'use strict';

  var path = require("path");
  var constants = require("./constants");

  // サーバ名.
  var SERVER_NAME = "" + constants.NAME + "(" + constants.VERSION + ")";

  // パスチェック.
  // ../ などの指定で、本来想定されているパス以外のアクセスを行おうとした
  // 場合は、エラー403にする.
  var _checkPath = function(head, base, url) {
    if(path.resolve(head + url).indexOf(base) != 0) {
      return false;
    }
    return true;
  }

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

  // httpサーバ開始処理.
  var _request = function(req, res, call) {
    // postデータのダウンロード.
    if(req.method.toLowerCase() == "post") {
      var charset = null;
      var body = null;
      var contentType = req.headers["content-type"];
      // 文字コードが設定されている場合.
      if(contentType) {
        // jsonの場合は、charset=utf-8
        if(contentType == "application/json") {
          charset = "utf-8";
        // post formデータの場合は charset=utf8
        } else if(contentType == "application/x-www-form-urlencoded") {
          charset = "utf-8";
        // それ以外の場合は charset の指定文字コードを取得.
        } else {
          charset = _getCharset(contentType);
        }
      }
      // コンテンツ長が設定されている場合.
      if(req.headers["content-length"]) {
        var off = 0;
        body = Buffer.allocUnsafe(req.headers["content-length"]|0);
        req.on('data', function(bin) {
          bin.copy(body, off);
          off += bin.length;
        });
        req.on('end', function() {
          var abuf = body;
          body = null;
          off = null;
          // 文字コードが設定されている場合は文字列変換.
          if(charset) {
            abuf = (new TextDecoder(charset)).decode(abuf);
          }
          call(req, res, abuf);
        });
      // コンテンツ長が設定されていない場合.
      } else {
        var body = [];
        var binLen = 0;
        req.on('data', function(bin) {
          body.push(bin);
          binLen += bin.length;
        });
        req.on('end', function() {
          var n = null;
          var off = 0;
          var abuf = Buffer.allocUnsafe(binLen);
          binLen = null;
          var len = body.length;
          for(var i = 0; i < len; i ++) {
            n = body[i]; body[i] = null;
            n.copy(abuf, off);
            off += n.length;
          }
          body = null;
          // 文字コードが設定されている場合は文字列変換.
          if(charset) {
            abuf = (new TextDecoder(charset)).decode(abuf);
          }
          call(req, res, abuf);
        });
      }
    } else {
      call(req, res, "");
    }
  }
  
  // content-typeからcharsetの情報を抽出.
  var _getCharset = function(type) {
    var p = type.indexOf("charset");
    if(p == -1) {
      return null;
    }
    var pp = type.indexOf("=", p + 7);
    if(pp == -1) {
      return null;
    }
    var end = type.indexOf(";", pp + 1);
    if(end == -1) {
      end = type.length;
    }
    return type.substring(pp + 1, end);
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
    headers['Server'] = SERVER_NAME;
    if(notCache) {
      headers['Pragma'] = 'no-cache';
    }
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Headers'] = crosHeaders + ', *';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, PUT, HEAD, PATCH, OPTIONS';
    if(closeFlag) {
      headers['Connection'] = 'close';
    }
    headers['Expire'] = "-1";
    headers['Date'] = _toRfc822(new Date());
    headers['Content-Length'] = bodyLength;
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

  var o = {};

  // パス不正チェック.
  o.checkPath = function(head, base, url) {
    return _checkPath(head, base, url)
  }

  // server.request.
  o.request = function(req, res, call) {
    _request(req, res, call);
  }

  // クロスヘッダを付与する.
  o.setCrosHeader = function(headers, bodyLength, notCache, closeFlag) {
    return _setCrosHeader(headers, bodyLength, notCache, closeFlag);
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