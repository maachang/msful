// http-client.
//
//

////////////////////////////////////////////////////////////////////////////////
// http_client.
// method : POST(JSON) or GET.
// URL : 接続先URL.
// option: 以下がオプションで設定できます.
//         params : パラメータ設定(Map定義).
//         noCache : キャッシュなしの場合は[true].
//         headers : ヘッダ情報.
// func : コールバックファンクション.
//        コールバックファンクションを設定しない場合は、同期取得(非推奨).
//        func(status, body, headers);
// errorFunc : エラー発生時のコールバックファンクション.
//             errorFunc(status, body, headers);
////////////////////////////////////////////////////////////////////////////////
module.exports = (function () {
  'use strict';
  var _u = undefined;

  var http = require("http");
  var https = require('https');
  var querystring = require('querystring');

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

  // http/httpsオプションを生成
  var _getOptions = function(method ,url, params, headers, noCache) {
    var urlPms = "";
    var p = url.indexOf("?");
    if(p != -1) {
      urlPms = url.substring(p + 1);
      url = url.substring(0, p);
    }
    // URL処理で、URLを分解.
    var urlOpt = new URL(url);
    var opt = {};
    for(var k in urlOpt) {
      if(typeof(urlOpt[k]) == "function") {
        continue;
      }
      if(urlOpt[k] != "") {
        // URL固有の読み替えが必要.
        if(k == "pathname") {
          opt["path"] = "" + urlOpt[k];
        } else {
          opt[k] = "" + urlOpt[k];
        }
      }
    }
    // ポート番号が存在しない場合.
    if(!opt.port) {
      if(opt.protocol == "http:") {
        opt.port = "80";
      } else if(opt.protocol == "https:") {
        opt.port = "443";
      }
    }
    // queryが設定されていた場合は、再設定.
    urlOpt = null;
    if(urlPms.length > 0) {
      opt.path += "?" + urlPms;
    }
    // 条件をセット.
    opt.headers = headers;
    if(!opt.headers) {
      opt.headers = {};
    }

    // パラメータが存在する場合.
    if(params) {
      if(method == "JSON") {
        // jsonの場合はContent-Typeが設定されていない場合はセット.
        if(!opt.headers["content-type"]) {
          opt.headers["content-type"] = "application/json; charset=utf-8;";
        }
        method = "POST";
      // POST以外の場合.
      } else if(method != "POST") {
        if(typeof(params) == "object") {
          params = querystring.stringify(params);
        } else {
          params = "" + params;
        }
        if((opt.path).indexOf("?") != -1) {
          opt.path += "&" + params;
        } else {
          opt.path += "?" + params;
        }
      // POSTの場合.
      } else {
        // postの場合はContent-Typeが設定されていない場合はセット.
        if(!opt.headers["content-type"]) {
          opt.headers["content-type"] = "application/x-www-form-urlencoded";
        }
      }
    }

    // メソッドをセット.
    opt.method = method;

    // ノーキャッシュの場合.
    if(noCache != false) {
      if(opt.path.indexOf("?") != -1) {
        opt.path += "&" + Date.now();
      } else {
        opt.path += "?" + Date.now();
      }
    }
    return opt;
  }

  return function(method ,url, option, func, errFunc) {
    if(typeof(func) != "function") {
      throw new Error("Synchronous execution is not supported.");
    }
    if(!option) {
      option = {};
    }
    var params = option["params"];
    var headers = option["headers"];
    var noCache = option["noCache"];
    if(!noCache) {
      noCache = option["no_cache"];
    }
    method = method.toUpperCase();

    // エラーハンドリングが設定されていない場合.
    if(typeof(errFunc) != "function") {
      errFunc = func;
    }

    // オプション生成.
    var opt = _getOptions(method ,url, params, headers, noCache);

    // methodがJSONの場合はPOSTに変更.
    var jsonFlag = false;
    if(method == "JSON") {
      jsonFlag = true;
      method = "POST";
    }

    // プロトコルから、httpかhttpsかのモジュール選択.
    var conn = null;
    if(opt.protocol == "http:") {
      conn = http;
    } else if(opt.protocol == "https:") {
      conn = https;
    } else {
      conn = http;
    }

    // POSTの場合.
    var postParamsFlag = false;
    if(method == "POST") {
      if(params) {
        if(typeof(params) == "object") {
          if((params instanceof Buffer) == false &&
            (params instanceof Uint8Array) == false) {
            if(jsonFlag) {
              params = JSON.stringify(params);
            } else {
              params = querystring.stringify(params);
            }
          }
        } else {
          params = "" + params;
        }
        if(params instanceof Buffer) {
          opt.headers["content-length"] = "" + Buffer.byteLength(params);
        } else if(params instanceof Uint8Array) {
          opt.headers["content-length"] = "" + params.length;
        } else {
          opt.headers["content-length"] = "" + _utf8Length(params);
        }
        postParamsFlag = true;
      } else {
        opt.headers["content-length"] = "0";
        params = "";
        postParamsFlag = true;
      }
      // content-typeが設定されていない場合.
      if(!opt.headers["content-type"]) {
        opt.headers["content-type"] = "application/octet-stream";
      }
    }

    // リクエストを生成.
    var req = conn.request(opt, function(res) {
      var body = null;
      var headers = res.headers;
      var charset = null;

      // 文字コードが設定されている場合.
      if(headers["content-type"]) {
        charset = _getCharset(headers["content-type"]);
      }

      // content-lengthがある場合.
      if(headers["content-length"]) {
        var off = 0;
        body = Buffer.allocUnsafe(headers["content-length"]|0);
        res.on('data', function(bin) {
          bin.copy(body, off);
          off += bin.length;
        });
        res.on('end', function() {
          var status = res.statusCode;
          if(!status) {
            status = 200;
          }
          var abuf = body;
          body = null;
          off = null;
          // 文字コードが設定されている場合は文字列変換.
          if(charset) {
            abuf = (new TextDecoder(charset)).decode(abuf);
          }
          func(status, abuf, res.headers);
        });
      // content-lengthがない場合.
      } else {
        var body = [];
        var binLen = 0;
        res.on('data', function(bin) {
          body.push(bin);
          binLen += bin.length;
        });
        res.on('end', function() {
          var status = res.statusCode;
          if(!status) {
            status = 200;
          }
          var n = null;
          var off = 0;
          var abuf = Buffer.allocUnsafe(binLen);
          binLen = null;
          var len = body.length;
          for(var i = 0; i < len; i ++) {
            n = body[i];body[i] = null;
            n.copy(abuf, off);
            off += n.length;
          }
          body = null;
          // 文字コードが設定されている場合は文字列変換.
          if(charset) {
            abuf = (new TextDecoder(charset)).decode(abuf);
          }
          func(status, abuf, res.headers);
        });
      }
    });

    // エラーハンドリング.
    req.on('error', function(e) {
      var status = e.status;
      if(!status) {
        status = 500;
      }
      errFunc(status, e.message, {});
    });

    // postデータセット.
    if(postParamsFlag) {
      req.write(params);
    }
    req.end();
  }
})();