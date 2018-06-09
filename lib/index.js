// micro json server.
//
//

exports.createMsFUL = function (port, contentsCacheMode) {
  'use strict';
  var _CACHE = true; // コンテンツキャッシュあり.
  var NONE = Object.freeze(new Object());
  var fs = require('fs');
  var vm = require('vm');
  var http = require('http');
  var path = require('path');
  var constants = require("./constants").get;
  var initMod = require("./modules/init")
  var SERVER_NAME = "msful(" + constants.VERSION + ")";
  
  // URLアクセスパス.
  var baseApiPath = path.resolve(constants.API_DIR);
  var baseHtmlPath = path.resolve(constants.HTML_DIR);
  
  // キャッシュ情報.
  var cacheApi = {cache:{}, time:Date.now()};
  var cacheRequire = {cache:{}, time:Date.now()};
  var backupRequire = {cache:{}, time:Date.now()};
  
  // モジュール群.
  var _MODULES = {};
  
  // コンフィグ群.
  var _CONFIG = {};
  
  // ポートが正しく割り当てられている場合はセット.
  var bindPort = constants.PORT;
  try {
    port = parseInt(port);
    if (port > 0 && port < 65535) {
      bindPort = port;
    }
  } catch (e) {
  }
  // コンテンツキャッシュモードがOFF設定の場合.
  try {
    if(contentsCacheMode == false || contentsCacheMode == "false") {
      _CACHE = false;
    }
  } catch(e) {
  }
  
  // httpサーバ生成.
  var createHttp = function (call) {
    return http.createServer(function (req, res) {
      var m = req.method.toLowerCase();
      if(m == "post") {
        var data = "";
        req.on("data", function (chunk) {
          data += chunk;
        });
        req.on("end", function () {
          call(req, res, data);
        });
      } else {
        call(req, res, "");
      }
    })
  }

  // パラメータ取得.
  var _getPms = function (request, response, data) {
    var ret = {};
    var m = request.method.toLowerCase();
    if (m == "post") {
      ret = _post(request, data);
    } else {
      ret = _get(request.url);
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
      // /jsonが含まれる場合はjson変換.
      return JSON.parse(data);
    }
    // それ以外は、Queryパラメータ変換.
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

  // 正しいURLを取得.
  var _getUrl = function (req) {
    var u = req.url;
    var p = u.indexOf("?");
    if (p == -1) {
      return u;
    }
    return u.substring(0, p);
  }

  // パスチェック.
  // ../ などの指定で、本来想定されているパス以外のアクセスを行おうとした
  // 場合は、エラー403にする.
  var checkPath = function(apiMode, url, res) {
    var ret = true;
    if(apiMode == true) {
      if(path.resolve(constants.API_PATH + url).indexOf(baseApiPath) != 0) {
        ret = false;
      }
    } else if(path.resolve(constants.HTML_DIR + url).indexOf(baseHtmlPath) != 0) {
      ret = false;
    }
    if(!ret) {
      errorApi({status: 403, message: "It is an illegal URL."}, 403, res);
    }
    return ret;
  }

  // HTTP実行.
  var exec = function (req, res, data) {
    var url = _getUrl(req);
    // アクセス禁止URL.
    if (url.indexOf("/@") != -1) {
      errorResult(403, null, res);
    // WebApi返却.
    } else if (url.indexOf("/api/") == 0) {
      if(checkPath(true, url, res)) {
        setImmediate(function() {
          readApi(req, res, data, url);
        });
      }
    // ファイル返却.
    } else if(checkPath(false, url, res)) {
      readFile(req, res, url);
    }
  }

  // モジュールをセット.
  var setModules = function(out, createOut) {
    initMod.setDefaults(out);
    for(var k in _MODULES) {
      out[k] = _MODULES[k];
    }
    out["config"] = _CONFIG;
  }
  
  // メモリ情報を取得.
  var createMemory = function(req, res, data) {
    var memory = {}
    setModules(memory);
    memory.NONE = NONE;
    memory.request = req;
    memory.response = res;
    memory.headers = {};
    memory.params = _getPms(req, res, data);
    
    // リダイレクト処理.
    memory.redirect = function(url, status) {
      status = status|0
      if(status == 0) {
        status = 303
      }
      memory.response.statusCode = status;
      memory.headers['Location'] = url;
    };
    
    // HTTPステータス取得、変更.
    memory.status = function(status) {
      status = status | 0;
      if (status != 0) {
        memory.response.statusCode = status;
      }
      return memory.response.statusCode;
    };
    
    // HTTPエラー返却.
    memory.httpError = function(status, message) {
      throw {status: status, message: message};
    };
    
    // 拡張require.
    memory.require =  Object.freeze(
      require("./require")(cacheRequire, backupRequire, _MODULES, _CONFIG));
    
    // 初期化が必要な処理を実行.
    initMod.createModules(req, res, memory.params);
    
    return memory;
  }
  
  // 正常戻り値処理.
  var successApi = function(status, headers, res, body) {
    var crosHeaders = "content-type";
    for(var k in headers) {
      k = k.toLowerCase();
      if(k.indexOf("x-") == 0) {
        crosHeaders += ", " + k;
      }
    }
    crosHeaders += ", ";
    var bodyLength = utf8Length(body);
    headers['Server'] = SERVER_NAME;
    headers['Pragma'] = 'no-cache';
    headers['Content-Type'] = 'application/json; charset=utf-8;';
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Headers'] = crosHeaders + '*';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, PUT, HEAD, PATCH, OPTIONS';
    headers['Connection'] = 'close';
    headers['Date'] = toRfc822(new Date());
    headers['Content-Length'] = bodyLength;
    
    // 返却処理.
    res.writeHead(status, headers);
    res.end(body);
  }
  
  // 実行エラー.
  var errorApi = function(e, status, res) {
    var message = "";
    if (e != undefined) {
      // httpErrorハンドリング.
      if (e["status"] != undefined) {
        status = e["status"]|0;
        if(e["message"] != undefined) {
          message = "" + e["message"];
        } else {
          message = "error " + status;
        }
        if(status >= 500) {
          console.error("httpError: status: " + status + " message: " + message);
        }
      }
      // 例外が発生した場合は、エラー返却.
      // ただし、ファイルが存在しない場合は、４０４返却.
      else if (e.code && e.code == 'ENOENT') {
        status = 404;
        message = "not found";
      } else {
        status = 500;
        message = "internal server error";
        console.error(e, e);
      }
    }
    var headers = {};
    headers['Server'] = SERVER_NAME;
    headers['Pragma'] = 'no-cache';
    headers['Content-Type'] = 'application/json; charset=utf-8;';
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Headers'] = 'content-type, *';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, PUT, HEAD, PATCH, OPTIONS';
    headers['Connection'] = 'close';
    var body = "{\"error\": " + status + ", \"message\": \"" + message + "\"}";
    var bodyLength = utf8Length(body);
    headers['Date'] = toRfc822(new Date());
    headers['Content-Length'] = bodyLength;
    
    // 返却処理.
    res.writeHead(status, headers);
    res.end(body);
  }
  
  // キャッシュチェック・削除時間.
  var CHECK_TIME = 60000;  // 60秒.
  var REMOVE_TIME = 300000; // 300秒.
  
  // 暫く利用していないモジュールをメモリから除外.
  var checkDeleteCache = function() {
    var now = Date.now();
    if(now > cacheApi.time + CHECK_TIME) {
      var n;
      var value = cacheApi.cache;
      cacheApi.time = now;
      for(var k in value) {
        n = value[k];
        if(now > n.update + REMOVE_TIME) {
          removeApiCache(k);
        }
      }
    }
  }
  
  // apiキャッシュ削除.
  var removeApiCache = function(name) {
    try {
      delete cacheApi.cache[name];
    } catch(e){}
  }
  
  // キャッシュ実行.
  var executeCacheApi = function(req, res, data, cache) {
    try {
      // 初期化.
      var memory = createMemory(req, res, data);
      var status = 200;
      var headers = memory.headers;
      var body = "";
      var bodyLength = 0;
      var closeable = memory.closeable;
      var eres = cache.call(memory);
      memory = null;
      
      // 返却処理.
      status = res.statusCode;
      if(eres != undefined && eres != null && eres != "") {
        body = JSON.stringify(eres);
      } else {
        body = "";
      }
      successApi(status, headers, res, body);
    } catch(e) {
      errorApi(e, status, res);
    } finally {
      if(closeable != undefined) {
        try {
          closeable.close();
        } catch(e){}
      }
      initMod.clearModules();
    }
  }

  // api読み込み.
  var readApi = function(req, res, data, url) {
    
    // キャッシュチェック.
    checkDeleteCache();
    
    // フィルタパスを生成.
    var dir = null;
    var p = url.lastIndexOf("/");
    if(p == -1) {
      dir = "/";
    } else {
      dir = url.substring(0, p+1);
    }
    var filterName = constants.API_PATH + dir + constants.FILTER_FILE;
    dir = null;
    
    // apiFileパスを生成.
    var apiFile = constants.API_PATH + url;
    if (apiFile.lastIndexOf("/") == apiFile.length - 1) {
      apiFile += "index.js";
    } else if(apiFile.lastIndexOf(".js") != apiFile.length - 3) {
      apiFile += ".js"
    }
    apiFile = path.resolve(apiFile);
    
    // それぞれの存在確認処理.
    var filterTime, apiTime;
    fs.stat(filterName, function (ferr, fstat) {
      fs.stat(apiFile, function(err, stat) {
        try {
          
          // apiデータが存在しない場合.
          if(!err) {
            
            // エラー処理.
            if (err) throw err;
          }
          
          // APIファイル時間を取得.
          apiTime = stat.mtime.getTime();
          
          // フィルタなしの実行処理.
          var filterSrc = "var fres = true;\n";
          
          // フィルタが存在する場合.
          if (!ferr) {
            filterTime = fstat.mtime.getTime();
            
            // キャッシュデータを取得.
            var cache = cacheApi.cache[apiFile];
            
            // [フィルタあり]キャッシュ実行可能かチェック.
            if(cache != undefined && cache.filterTime == filterTime && cache.apiTime == apiTime) {
              cache.update = Date.now();
              executeCacheApi(req, res, data, cache);
              return;
            }
            cache = null;
            
            // フィルタセット.
            filterSrc = "var fres = (function() {\n" +
              fs.readFileSync(filterName, "utf-8") + "\n" +
              "})();\n";
          
          } else {
            
            // キャッシュデータを取得.
            var cache = cacheApi.cache[apiFile];
            
            // [フィルタなし]キャッシュ実行可能かチェック.
            if(cache != undefined && cache.filterTime == -1 && cache.apiTime == apiTime) {
              cache.update = Date.now();
              executeCacheApi(req, res, data, cache);
              return;
            }
            cache = null;
            filterTime = -1;
          }
          
          // 実行スクリプト生成.
          var scriptSrc = 
          "(function() {\n" +
            "return function(_mm){\n" +
            "'use strict';\n" +
            "var m=_$m3M0_3$_$;for(var k in m){if(m[k]!=m){delete m[k]}}\n" +
            "for(var k in _mm){m[k]=_mm[k];};_mm=null;m = null;\n" +
            "var apiCall = function() {\n" +
            fs.readFileSync(apiFile, "utf-8") +
            "\nreturn NONE;\n};\n" +
            filterSrc +
            "if (typeof(fres) == 'boolean') {\n" +
            "  if (fres) {\n" +
            "    return apiCall();\n" +
            "  } else {\n" +
            "    httpError(500, 'exit filter.');\n" +
            "  }\n" +
            "}\n" +
            "return fres;\n" +
            "}\n" +
          "})();";
          filterSrc = null;
          
          // 初期化.
          var memory = createMemory(req, res, data);
          var status = 200;
          var headers = memory.headers;
          var body = "";
          var bodyLength = 0;
          var closeable = memory.closeable;
          
          // 実行処理.
          var script = new vm.Script(scriptSrc);
          scriptSrc = null;
          
          // 操作可能なglobalをセット.
          var _g = {};_g['_$m3M0_3$_$'] = _g;
          // 上書き禁止.
          Object.defineProperty(_g, '_$m3M0_3$_$', {writable : false});
          var context = vm.createContext(_g);
          var scriptCall = script.runInContext(context);
          var eres = scriptCall(memory);
          
          // 実行成功の場合キャッシュセット.
          cacheApi.cache[apiFile] = {
            call:scriptCall,
            update: Date.now(),
            filterTime: filterTime,
            apiTime: apiTime
          };
          
          // クリア.
          script = null; memory = null; context = null; scriptCall = null;
          
          // 返却処理.
          status = res.statusCode;
          if(eres != undefined && eres != null && eres != "") {
            body = JSON.stringify(eres);
          } else {
            body = "";
          }
          successApi(status, headers, res, body);
        } catch(e) {
          removeApiCache(apiFile);
          errorApi(e, status, res);
        } finally {
          if(closeable != undefined) {
            try {
              closeable.close();
            } catch(e){}
          }
          initMod.clearModules();
        }
      });
    });
  }

  // ファイル読み込み.
  var readFile = function (req, res, url) {
    if (url.lastIndexOf("/") == url.length - 1) {
      url += "index.html";
    }
    var name = constants.HTML_DIR + url;
    var mime = mimeType(url);
    var headers = { 'Server': SERVER_NAME, 'Content-Type': mime };
    if((mime.indexOf("text/") != -1 || mime.indexOf("xml") != -1) &&
      req.headers["accept-encoding"] && req.headers["accept-encoding"].indexOf("gzip") != -1) {
      headers["Content-Encoding"] = "gzip";
      readTargetFile(req, res, name + ".gz", headers, function(errorState, errorFileName, e) {
        if(errorState == 404) {
          delete headers["Content-Encoding"]
          readTargetFile(req, res, name, headers, function(errorState, errorFileName, e) {
            errorResult(errorState, e, res);
          });
        } else {
          errorResult(errorState, e, res);
        }
      });
    } else {
      readTargetFile(req, res, name, headers, function(errorState, errorFileName, e) {
        errorResult(errorState, e, res);
      });
    }
  }

  // 指定１ファイル読み込み.
  var readTargetFile = function(req, res, name, appendHeaders, errorCall) {
    fs.stat(name, function (err, stat) {
      var status = 200;
      var headers = {};
      var body = "";
      var bodyLength = 0;
      try {
        if (err) throw err;
        // フォルダアクセスの場合は403返却.
        if(stat.isDirectory()) {
          errorResult(403, null, res);
          return;
        }
        var mtime = stat.mtime.getTime();
        headers['Last-Modified'] = toRfc822(new Date(mtime));
        if(appendHeaders != null) {
          for(var k in appendHeaders) {
            headers[k] = appendHeaders[k];
          }
        }
        // リクエストヘッダを見て、If-Modified-Sinceと、ファイル日付を比較.
        if (req.headers["if-modified-since"] != undefined) {
          if (_CACHE && isCache(mtime, req.headers["if-modified-since"])) {
            
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
      if(err != null) {
        console.error(err + " status:" + status, err);
      } else {
        console.error("error: " + status);
      }
    }
    headers['Content-Type'] = "text/html; charset=utf-8";
    headers['Pragma'] = 'no-cache';
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
    return parseInt(a / 1000) == parseInt(new Date(b).getTime() / 1000);
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
  
  // デフォルトのモジュールを読み込む.
  initMod.loadModules(_MODULES);
  
  // コンフィグ情報を読み込む.
  initMod.readConfig(_CONFIG, constants.CONF_DIR);
  _CONFIG = Object.freeze(_CONFIG);
  
  // サーバー生成.
  var server = createHttp(exec);
  
  // 指定ポートで待つ.
  server.listen(bindPort);
  console.info("## listen: " + bindPort + " contentCache:" + _CACHE + " pid:" + process.pid);
}
