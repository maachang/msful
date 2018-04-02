// micro json server. version 0.0.8.

exports.createMsFUL = function (port) {
  'use strict';
  var fs = require('fs');
  var http = require('http');
  var PORT = 3333;
  var SERVER_NAME = "msful";
  var HTML_DIR = "./html";
  var API_DIR = ".";

  // ポートが正しく割り当てられている場合はセット.
  try {
    port = parseInt(port);
    if (port > 0 && port < 65535) {
      PORT = port;
    }
  } catch (e) {
  }

  // クラスタ起動.
  var cluster = require('cluster');
  var MAX_SERVER = require('os').cpus().length;
  if (cluster.isMaster) {
    for (var i = 0; i < MAX_SERVER; ++i) {
      cluster.fork();
    }
    cluster.on('exit', function (worker, code, signal) {
      cluster.fork();
    });
    console.info("## listen: " + PORT);
    
  // サーバ起動.
  } else {
    
    // httpサーバ生成.
    var createHttp = function (call) {
      return http.createServer(function (req, res) {
        var data = "";
        req.on("data", function (chunk) {
          data += chunk;
        });
        req.on("end", function () {
          res = call(req, res, data);
        });
      })
    }

    // パラメータ取得.
    var getPms = function (request, response, data) {
      var ret = {};
      var m = request.method.toLowerCase();
      if (m == "get") {
        ret = _get(request.url);
      } else if (m == "POST") {
        ret = _post(request, data);
      }
      return ret;
    }
    
    // GETパラメータを処理.
    var _get = function (url) {
      var p = url.indexOf("?");
      if (p == -1) {
        return {};
      }
      return _analysisParams(url.substring(p + 1));
    }

    // POSTパラメータ処理.
    var _post = function (request, data) {
      var c = request.headers["content-type"];
      // octet-streamの場合は、バイナリデータを受信・返却する.
      if (c == "application/octet-stream") {
        return data;
      } else if (c.indexOf("/json") != -1) {
        return JSON.parse(data);
      }
      return _analysisParams(data);
    }

    // パラメータ解析.
    var _analysisParams = function (n) {
      var list = n.split("&");
      var len = list.length;
      var ret = {};
      for (var i = 0; i < len; i++) {
        n = list[i].split("=");
        if (n.length == 1) {
          ret[n[0]] = '';
        } else {
          ret[n[0]] = decodeURIComponent(n[1]);
        }
      }
      return ret;
    }

    // HTTP実行.
    var exec = function (req, res, data) {
      var url = getUrl(req);
      // WebApi返却.
      if (url.indexOf("/api/") == 0) {
        readApi(req, res, data, url);
        // ファイル返却.
      } else {
        readFile(req, res, url);
      }
    }

    // api読み込み.
    var readApi = function (req, res, data, url) {
      if (url.lastIndexOf("/") == url.length - 1) {
        url += "index.js";
      } else if(url.lastIndexOf(".js") != url.length - 3) {
        url += ".js"
      }
      console.log("URL:" + url);
      var name = API_DIR + url;
      fs.readFile(name, function (err, src) {
        var status = 200;
        var headers = { 'Server': SERVER_NAME };
        var body = "";
        var bodyLength = 0;
        try {
          if (err) throw err;
          src = "return (function(_g) {\n" +
            "var request = args.req\n" +
            "var response = args.res\n" +
            "var params = getPms(request, response, args.data)\n" +
            "args = null\n" +
            "getPms = null\n" +
            src +
            "\n})(global)";
          var eres = new Function('args', 'getPms', src)(
            { req: req, res: res, data: data }, getPms)
          src = null;
          body = JSON.stringify(eres);
          eres = null;
          bodyLength = utf8Length(body);
          headers['Content-Type'] = 'application/json; charset=utf-8;';
          headers['Connection'] = 'close';
        } catch (e) {
          // 例外が発生した場合は、エラー返却.
          // ただし、ファイルが存在しない場合は、４０４返却.
          if (e.code && e.code == 'ENOENT') {
            status = 404;
          } else {
            status = 500;
            console.error(e, e);
          }
          headers['Content-Type'] = 'application/json; charset=utf-8;';
          headers['Connection'] = 'close';
          body = "{\"error\": " + status + "}";
          bodyLength = utf8Length(body);
        }
        headers['Date'] = toRfc822(new Date());
        headers['Content-Length'] = bodyLength;
        
        // 返却処理.
        res.writeHead(status, headers);
        res.end(body);
      });
    }

    //  ファイル読み込み.
    var readFile = function (req, res, url) {
      if (url.lastIndexOf("/") == url.length - 1) {
        url += "index.html";
      }
      var name = HTML_DIR + url;
      var mime = mimeType(url);
      var headers = { 'Server': SERVER_NAME, 'Content-Type': mime };
      if((mime.indexOf("text/") != -1 || mime.indexOf("xml") != -1) && req.headers["accept-encoding"].indexOf("gzip") != -1) {
        headers["Content-Encoding"] = "gzip";
        readTargetFile(false, req, res, name + ".gz", headers, function(errorState, errorFileName, e) {
          if(errorState == 404) {
            delete headers["Content-Encoding"]
            readTargetFile(false, req, res, name, headers, function(errorState, errorFileName, e) {
              errorResult(errorState, e, res);
            });
          } else {
            errorResult(errorState, e, res);
          }
        });
      } else {
        readTargetFile(false, req, res, name, headers, function(errorState, errorFileName, e) {
          errorResult(errorState, e, res);
        });
      }
    }

    // 指定１ファイル読み込み.
    var readTargetFile = function(sync, req, res, name, appendHeaders, errorCall) {
      fs.stat(name, function (err, stat) {
        var status = 200;
        var headers = {};
        var body = "";
        var bodyLength = 0;
        try {
          if (err) throw err;
          headers['Last-Modified'] = toRfc822(new Date(stat.mtime));
          if(appendHeaders != null) {
            for(var k in appendHeaders) {
              headers[k] = appendHeaders[k];
            }
          }
          // リクエストヘッダを見て、If-Modified-Sinceと、ファイル日付を比較.
          if (req.headers["if-modified-since"] != undefined) {
            if (isCache(stat.mtime, req.headers["if-modified-since"])) {
              
              // キャッシュの場合.
              status = 304;
              headers['Date'] = toRfc822(new Date());
              headers['Content-Length'] = bodyLength;
              
              // 返却処理.
              res.writeHead(status, headers);
              res.end(body);
              return;
            }
          }
          // ファイル情報は非同期で読む.
          headers['Content-Length'] = stat.size;
          headers['Date'] = toRfc822(new Date());
          
          // 返却処理.
          res.writeHead(status, headers);
          var readableStream = fs.createReadStream(name);
          readableStream.on('data', function (data) {
            res.write(data);
          });
          readableStream.on('end', function () {
            res.end();
          });
        } catch (e) {
          errorCall((e.code && e.code == 'ENOENT') ? 404 : 500, name, e);
        }
      });
    }

    // エラー返却処理.
    var errorResult = function(status, err, res) {
      var headers = { 'Server': SERVER_NAME };
      var body = "";
      var bodyLength = 0;
      if (status >= 500) {
        console.error(err, err);
      }
      headers['Content-Type'] = "text/html; charset=utf-8";
      headers['Connection'] = 'close';
      body = "error: " + status;
      bodyLength = utf8Length(body);
      
      // 返却処理.
      headers['Date'] = toRfc822(new Date());
      headers['Content-Length'] = bodyLength;
      res.writeHead(status, headers);
      res.end(body);
    }

    // キャッシュ条件かチェック.
    var isCache = function (a, b) {
      return parseInt(new Date(a).getTime() / 1000) == parseInt(new Date(b).getTime() / 1000);
    }

    // 正しいURLを取得.
    var getUrl = function (req) {
      var u = req.url;
      var p = u.indexOf("?");
      if (p == -1) {
        return u;
      }
      return u.substring(0, p);
    }

    // ファイル拡張子からMimeTypeを返却.
    var mimeType = function (name) {
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
      }
      return "application/octet-stream";
    }

    // 日付情報をRFC-822に変換.
    var toRfc822 = function (n) {
      if (typeof (n) == "number") {
        n = new Date(parseInt(n));
      }
      return n.toUTCString();
    }

    // UTF8文字列のバイナリ長を取得.
    var utf8Length = function (n) {
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

    // サーバー生成.
    var server = createHttp(exec);
    
    // 指定ポートで待つ.
    server.listen(PORT);
  }
}
