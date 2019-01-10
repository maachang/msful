// micro json server.
//
//

exports.createMsFUL = function (port, timeout, contentsCacheMode) {
  'use strict';
  var _u = undefined
  var _CACHE = true; // コンテンツキャッシュあり.
  var fs = require('fs');
  var vm = require('vm');
  var http = require('http');
  var path = require('path');
  var constants = require("./constants").get;
  var initMod = require("./modules/init");
  var u = require("./modules/u");
  var SERVER_NAME = "msful(" + constants.VERSION + ")";

  // Forbidden-URL.
  var FORBIDDEN_URL = "/@";

  // API_PATH.
  var API_PATH = "/api/";

  // TOPメモリ(global).
  var _TOP_MEMORY = Object.freeze("_$t06_$$m3M0_3$_$");

  // スクリプト送信終了フラグ(success).
  var _EXIT_SEND_SCRIPT_FLG = Object.freeze("_$eXit_$sEnd_$fLag_$");

  // スクリプト送信エラーフラグ(error).
  var _EXIT_SEND_ERROR_SCRIPT_FLG = Object.freeze("_$eR08r_$sEnd_$fLag_$");

  // データなし(return),
  var NONE = Object.freeze(new Object());

  // Array.prototype.slice.
  var _Array_prototype_slice_object = Array.prototype.slice;
  
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

  // コンフィグ情報を読み込む.
  var _loadConfig = function() {
    initMod.readConfig(_CONFIG, constants.CONF_DIR);
    _CONFIG = Object.freeze(_CONFIG);
  }

  // パラメータ取得.
  var _getPms = function (request, data) {
    var ret = {};
    var m = request.method.toLowerCase();
    if (m == "post") {
      ret = _$post(request, data);
    } else {
      ret = _$get(request.url);
    }
    return ret;
  }
  
  // GETパラメータを処理.
  var _$get = function (url) {
    var p = url.indexOf("?");
    if (p == -1) {
      return {};
    }
    return _analysisParams(url.substring(p + 1));
  }

  // POSTパラメータ処理.
  var _$post = function (request, data) {
    var c = request.headers["content-type"];
    // octet-streamの場合は、バイナリデータ(Buffer)を受信・返却する.
    if (c == "application/octet-stream") {
      return new Buffer(data);
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
  
  // スクリプト送信終了チェック.
  var _endSendScript = function(m) {
    var ret = true;
    try {
      ret = m.response == _u || m[_EXIT_SEND_SCRIPT_FLG] || m[_EXIT_SEND_ERROR_SCRIPT_FLG];
    } catch(e) {}
    return ret;
  }
  
  // スクリプト送信エラーかチェック.
  var _errorSendScript = function(m) {
    var ret = true;
    try {
      ret = m[_EXIT_SEND_ERROR_SCRIPT_FLG];
    } catch(e) {}
    return ret;
  }
  
  // [スクリプト結果]書き込み処理.
  var _send = function(m, status, body) {
    if (m[_EXIT_SEND_SCRIPT_FLG] || m[_EXIT_SEND_ERROR_SCRIPT_FLG]) {
      return false;
    }
    try {
      // 書き込み処理.
      m.response.writeHead(status, m.headers);
      m.response.end(body);
      
      // スクリプト終了.
      m[_EXIT_SEND_SCRIPT_FLG] = true;
      return true;
    } catch (e) {
      // エラーをデバッグ出力.
      console.debug(e);
      // レスポンスソケットクローズ.
      try {
        m.response.socket.destroy();
      } catch (ee) {}
      // エラー終了フラグをセット.
      try {
        m[_EXIT_SEND_ERROR_SCRIPT_FLG] = true;
      } catch (ee) {}
      return false;
    }
  }

  // cros対応ヘッダを設定.
  var _setCrosHeader = function(headers, bodyLength) {
    var crosHeaders = "content-type";
    for(var k in headers) {
      k = k.toLowerCase();
      if(k.indexOf("x-") == 0) {
        crosHeaders += ", " + k;
      }
    }
    headers['Server'] = SERVER_NAME;
    headers['Pragma'] = 'no-cache';
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Headers'] = crosHeaders + ', *';
    headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, PUT, HEAD, PATCH, OPTIONS';
    headers['Connection'] = 'close';
    headers['Date'] = toRfc822(new Date());
    headers['Content-Length'] = bodyLength;
  }

  // [binary]正常戻り値処理.
  var successBinary = function(m, status, body, charset) {
    if (_endSendScript(m)) {
      return false;
    }
    // bodyが文字列の場合はBufferに変換.
    if (body instanceof String) {
      if(charset == _u || charset == null || charset == "") {
        charset = "uft-8";
      }
      body = Buffer.from(body, charset);
    }
    // bodyがBufferでない場合は、エラー.
    if (!(body instanceof Buffer)) {
      throw new Error("The body data is not in binary format.");
    }
    // cros対応ヘッダを設定.
    var headers = m.headers;
    _setCrosHeader(headers, body.length);

    // cros対応ヘッダを設定.
    return _send(m, status, body);
  }
  
  // [webApi]正常戻り値処理.
  var successApi = function(m, status, body) {
    if (_endSendScript(m)) {
      return false;
    }
    var headers = m.headers;
    _setCrosHeader(headers, utf8Length(body));
    headers['Content-Type'] = 'application/json; charset=utf-8;';
    
    // 返却処理.
    return _send(m, status, body);
  }
  
  // 実行エラー.
  var errorApi = function(m, e, status, trace) {
    if (_endSendScript(m)) {
      return false;
    }
    var message = "";
    if (e != _u) {
      // httpErrorハンドリング.
      if (e["status"] != _u) {
        status = e["status"]|0;
        if(e["message"] != _u) {
          message = "" + e["message"];
        } else {
          message = "error " + status;
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
      }
      if(status >= 500) {
        console.error("http_error: status: " + status + " message: " + message);
        if(trace != _u) {
          console.trace(trace);
        }
      }
    } else if(status >= 500) {
      console.error("http_error: status: " + status + " message: " + message);
    }
    var headers = m.headers;
    var body = "{\"error\": " + status + ", \"message\": \"" + message + "\"}";
    _setCrosHeader(headers, utf8Length(body));
    headers['Content-Type'] = 'application/json; charset=utf-8;';

    // 返却処理.
    return _send(m, status, body);
  }

  // スクリプト終了.
  var _exit = function() {
    try {
      exit;
    } catch(e){}
  }

  // Respオブジェクト.
  var ResponseContext = function(mm) {
    this._m = mm;
    this._promise = false;
    this._sendBuffer = null;
  }
  
  // 次の実行処理をセット.
  ResponseContext.prototype.push = function(call) {
    if(typeof(call) != "function") {
      this.error(500, "The next method argument to be executed is not a function.");
    }
    if(this._nstack == _u) {
      this._nstack = u.stack();
    }
    this._nstack.push(call);
  }
  
  // 次の実行処理が存在するかチェック.
  ResponseContext.prototype.size = function() {
    if(this._nstack == _u) {
      return 0;
    }
    return this._nstack.size();
  }
  
  // 次に実行するメソッドを実行.
  // 次に実行するメソッドが存在しない場合はエラーを出力.
  ResponseContext.prototype.next = function() {
    if(this._nstack == _u) {
      this.error(500, "Next method does not exist.");
    }
    var call = this._nstack.pop();
    if(call == _u) {
      this.error(500, "Next method does not exist.");
    }
    return call();
  }
  
  // 正常時のWebAPI返却.
  ResponseContext.prototype.send = function(body, status) {
    if(body == _u || body == null || body == NONE) {
      throw new Error("It is not valid Body data.")
    }
    var m = this._m;
    if((status|0) <= 0) {
      status = m.response.statusCode;
      if((status|0) <= 0) {
        status = 200;
      }
    }
    if(this._promise) {
      this._sendBuffer = {
        type: 1,
        status: status,
        body: JSON.stringify(body)
      }
      return "OK";
    }
    try {
      m.response.statusCode = status;
      successApi(m, status, JSON.stringify(body));
    } catch(e) {
      console.debug(e);
    } finally {
      _closeable(m);
    }
    _exit();
  };

  // 正常時のデータ返却.
  ResponseContext.prototype.binary = function(body, status, charset) {
    if(body == _u || body == null || body == NONE) {
      throw new Error("It is not valid Body data.")
    }
    var m = this._m;
    if((status|0) <= 0) {
      status = m.response.statusCode;
      if((status|0) <= 0) {
        status = 200;
      }
    }
    if(this._promise) {
      this._sendBuffer = {
        type: 2,
        status: status,
        body: body,
        charset: charset
      }
      return "OK";
    }
    try {
      m.response.statusCode = status;
      successBinary(m, status, body, charset);
    } catch(e) {
      console.debug(e);
    } finally {
      _closeable(m);
    }
    _exit();
  };

  // リダイレクトを行う場合に呼び出す.
  ResponseContext.prototype.redirect = function(url, status) {
    status = status|0
    if(status <= 0) {
      status = 303
    }
    if(this._promise) {
      this._sendBuffer = {
        type: 3,
        status: status,
        location: url
      }
      return "OK";
    }
    var m = this._m;
    try {
      m.response.statusCode = status;
      m.headers['Location'] = url;
      m.rtx.success("", status);
    } catch(e) {
      console.debug(e);
    } finally {
      _closeable(m);
    }
    _exit();
  };
  
  // エラー出力時に呼び出す.
  ResponseContext.prototype.error = function(status, message, e) {
    var m = this._m;
    status = status|0;
    if(status <= 0) {
      status = 500;
    }
    try {
      if(message == _u) {
        errorApi(m, e, status, e);
      } else {
        errorApi(m, {status: status, message: message}, status, e);
      }
    } catch(ee) {
      console.debug(ee);
    } finally {
      this._sendBuffer = null;
      _closeable(m);
    }
    _exit();
  };

  // ステータスセット、現在のステータス情報を取得.
  ResponseContext.prototype.status = function(status) {
    var m = this._m;
    status = status | 0;
    if (status != 0) {
      m.response.statusCode = status;
    }
    return m.response.statusCode;
  };

  // スクリプト送信済みかチェック.
  ResponseContext.prototype.isSendScript = function() {
    return _endSendScript(this._m);
  }

  // スクリプト送信エラーかチェック.
  ResponseContext.prototype.isErrorSendScript = function() {
    return _errorSendScript(this._m);
  }

  // レスポンス終了処理.
  var _end_rtx = function(m) {
    if(m.rtx._promise) {
      var buf = m.rtx._sendBuffer;
      m.rtx._sendBuffer = null;
      if(buf != null) {
        try {
          switch(buf.type) {
            case 1:
              m.response.statusCode = buf.status;
              successApi(m, buf.status, buf.body);
              return "OK";
            case 2:
              m.response.statusCode = buf.status;
              successBinary(m, buf.status, buf.body, buf.charset);
              return "OK";
            case 3:
              m.response.statusCode = buf.status;
              m.headers['Location'] = buf.url;
              m.rtx.success("", buf.status);
              return "OK";
            default:
              return "NG";
          }
        } catch(e) {
          console.debug(e);
        } finally {
          _closeable(m);
        }
      }
    }
  }

  // エラー.
  var _error = function(mm) {
    var _m = mm; mm = null;
    return function(e, status, err) {
      try {
        return errorApi(_m, e, status, (err == _u) ? e: err);
      } catch(ee) {}
      return false;
    };
  }
  
  // サーバエラー.
  var _serverError = function(mm) {
    var _m = mm; mm = null;
    return function(status, message, e) {
      try {
        if(message == _u) {
          return errorApi(_m, e, status, e);
        } else {
          return errorApi(_m, {status: status, message: message}, status, e);
        }
      } catch(ee) {
        console.debug(ee);
      } finally {
        this._sendBuffer = null;
        _closeable(_m);
      }
      return false;
    };
  }

  // クローズ後の実行処理.
  var _closeable = function(_m) {
    if(_m.closeable != _u) {
      try {
        _m.closeable.close();
      } catch(e){}
    }
    initMod.clearModules();
  }

  // 非同期用キャッチ処理.
  var _catchsByAsync = function(e, _m) {
    try {
      _m._serverError(500, "internal server error", e);
    } catch(ee) {}
  }

  // setImmediate拡張.
  var __setImmediate = global.setImmediate;
  var _setImmediate = function(mm) {
    return function() {
      var m = mm; mm = null;
      var call = arguments[0];
      var args = [];
      if(arguments.length > 1) {
        args = _Array_prototype_slice_object.call(arguments, 1);
      }
      return __setImmediate(function() {
        try {
          call.apply(null, args);
        } catch(e) {
          _catchsByAsync(e, m);
        }
      });
    }
  }

  // setInterval拡張.
  var __setInterval = global.setInterval;
  var _setInterval = function(mm) {
    return function() {
      var m = mm; mm = null;
      var call = arguments[0];
      var time = arguments[1];
      var args = [];
      if(arguments.length > 2) {
        args = _Array_prototype_slice_object.call(arguments, 2);
      }
      return __setInterval(function() {
        try {
          call.apply(null, args);
        } catch(e) {
          _catchsByAsync(e, m);
        }
      },time);
    }
  }

  // setTimeout拡張.
  var __setTimeout = global.setTimeout;
  var _setTimeout = function(mm) {
    return function() {
      var m = mm; mm = null;
      var call = arguments[0];
      var time = arguments[1];
      var args = [];
      if(arguments.length > 2) {
        args = _Array_prototype_slice_object.call(arguments, 2);
      }
      return __setTimeout(function() {
        try {
          call.apply(null, args);
        } catch(e) {
          _catchsByAsync(e, m);
        }
      },time);
    }
  }

  // コンソール出力.
  var _echo = function(n) {
    process.stdout.write(n + "\n");
  }

  // パスチェック.
  // ../ などの指定で、本来想定されているパス以外のアクセスを行おうとした
  // 場合は、エラー403にする.
  var _checkPath = function(head, base, url, res) {
    if(path.resolve(head + url).indexOf(base) != 0) {
      errorApi({headers:{}, response: res}, {status: 403, message: "It is an illegal URL."}, 403);
    }
  }

  // HTTP実行.
  var exec = async function(req, res, data) {
    // URLを取得.
    var url = _getUrl(req);
    
    // APIアクセス.
    if (url.indexOf(API_PATH) == 0) {
      
      // アクセス禁止URL.
      if (url.indexOf(FORBIDDEN_URL) != -1) {
        
        // アクセス禁止.
        errorApi({headers:{}, response: res}, {status: 403, message: "error: 403"}, 403);
      }
      
      // WebAPIのパスチェック.
      _checkPath(constants.API_PATH, baseApiPath, url, res);
      // WebApi返却.
      readApi(req, res, data, url);
      
    // コンテンツアクセス.
    } else {
      
      // アクセス禁止URL.
      if (url.indexOf(FORBIDDEN_URL) != -1) {
        
        // アクセス禁止.
        errorFileResult(403, null, res);
      }
      
      // 静的ファイルパスチェック.
      _checkPath(constants.HTML_DIR, baseHtmlPath, url, res);
      // ファイル返却.
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
    memory[_EXIT_SEND_SCRIPT_FLG] = false;
    memory[_EXIT_SEND_ERROR_SCRIPT_FLG] = false;
    memory.NONE = NONE;
    memory.request = req;
    memory.response = res;
    memory.headers = {};
    memory.params = _getPms(req, data);
    
    // キャッシュ削除.
    memory._removeApiCache = removeApiCache;

    // レスポンスコンテキスト終了処理.
    memory._end_rtx = _end_rtx;

    // エラーハンドリング.
    memory._error = _error(memory);

    // サーバエラー処理.
    memory._serverError = _serverError(memory);

    // コンソール出力.
    memory.echo = _echo;

    // ResponseContext処理.
    memory.rtx = new ResponseContext(memory);

    // promise.
    memory.$ = function() {
      memory.rtx._promise = true;
      return new Promise(function(resolve, reject) {
        resolve(memory.rtx)
      })
    }
    
    // 拡張require.
    memory.require = Object.freeze(
      require("./require")(cacheRequire, backupRequire, _MODULES, _CONFIG));

    // タイマー系.
    // try catch を入れて、エラーハンドリング時にHTTPレスポンスを返却.
    memory.setImmediate = _setImmediate(memory);
    memory.setInterval = _setInterval(memory);
    memory.setTimeout = _setTimeout(memory);
    
    // 初期化が必要な処理を実行.
    initMod.createModules(req, res, memory.params);

    return memory;
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
  var executeCacheApi = function(name, req, res, data, cache) {
    try {
      // 初期化.
      var memory = createMemory(req, res, data);
      var status = 200;
      
      // 実行処理.
      cache.call(memory);
      
    } catch(e) {
      errorApi(memory, e, status, e);
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
    fs.stat(filterName, function (ferr, fstat) {
      fs.stat(apiFile, function(err, stat) {
        var filterTime, apiTime;
        try {
          
          // apiデータが存在しない場合.
          if(!err) {
            
            // エラー処理.
            if (err) throw err;
          }
          
          // APIファイル時間を取得.
          apiTime = stat.mtime.getTime();
          
          // フィルタなしの実行処理.
          var filterSrc = "rtx.next();\n";
          
          // フィルタが存在する場合.
          if (!ferr) {
            filterTime = fstat.mtime.getTime();
            
            // キャッシュデータを取得.
            var cache = cacheApi.cache[apiFile];
            
            // [フィルタあり]キャッシュ実行可能かチェック.
            if(cache != _u && cache.filterTime == filterTime && cache.apiTime == apiTime) {
              cache.update = Date.now();
              executeCacheApi(apiFile, req, res, data, cache);
              return;
            }
            cache = null;
            
            // フィルタセット.
            filterSrc = "(function() {\n" +
              "return " + fs.readFileSync(filterName, "utf-8") +
            "\n})();\n";
          
          } else {
            
            // キャッシュデータを取得.
            var cache = cacheApi.cache[apiFile];
            
            // [フィルタなし]キャッシュ実行可能かチェック.
            if(cache != _u && cache.filterTime == -1 && cache.apiTime == apiTime) {
              cache.update = Date.now();
              executeCacheApi(apiFile, req, res, data, cache);
              return;
            }
            cache = null;
            filterTime = -1;
          }
          
          // 実行スクリプト生成.
          var scriptSrc = 
          "(function() {\n" +
            "var _api_name=Object.freeze(\""+apiFile+"\");\n" +
            "return function(_mm){\n" +
              "'use strict';\n" +
              
              // topメモリの張替え.
              "(function(mm){\n" +
              //"var m="+_TOP_MEMORY+";for(var k in m){if(m[k]!=m){delete m[k];}}\n" +
              "var m="+_TOP_MEMORY+";for(var k in m){if(m[k]!=m){m[k] = undefined;}}\n" +
              "for(var k in mm){m[k]=mm[k];};mm=undefined;m=undefined;\n" +
              "})(_mm);\n" +
              "_mm=undefined;\n" +
              
              // unhandledRejection の例外ハンドリング.
              "var _ur = null;\n" +
              
              "try {\n" +
                
                // unhandledRejection の例外ハンドリング(EventEmitterの上限を超えるので、現状除外).
                "//_ur = process.once('unhandledRejection', function(reason, p) {\n" +
                  "//try {\n" +
                    "//_serverError(500, 'Unknonw Error.', reason);\n" +
                  "//} catch(e){}\n" +
                "//});\n" +
                
                // api実行用メソッドをResp.next実行用にセット.
                "rtx.push(function() {\n" +
                  "return (function() {\n" +
                    fs.readFileSync(apiFile, "utf-8") +
                  "\n})();" +
                "\n});\n" +
                
                // フィルタ実行.
                "var result = " + filterSrc + "\n" +
                // 処理結果がPromiseの場合.
                "if (result && typeof(result['then']) === 'function') {\n" +
                  "result.then(function() { return _end_rtx(rtx._m) });" +
                  "result.catch(function(e) {\n" +
                    "_error(e);\n" +
                  "});\n" +
                "\n}" +
              "\n} catch(e) {\n" +
                // ここで落ちる場合は、シンタックスエラー(文法系エラー)なので、
                // キャッシュ削除と、closeableが動かないエラー返却を行う.
                "_removeApiCache(_api_name);\n" +
                "_error(e);\n" +
              "} finally {\n" +
              
                // unhandledRejection の例外ハンドリングクリア(EventEmitterの上限を超えるので、現状除外).
                "if (_ur != null) {\n" +
                  "//try { process.removeEventLister('unhandledRejection', _ur); } catch(ee){}\n" +
                "}\n" +
              "}\n" +
            "}\n" +
          "})();";
          filterSrc = null;
          
          // 初期化.
          var memory = createMemory(req, res, data);
          var status = 200;
          
          // 実行処理.
          var script = new vm.Script(scriptSrc, {filename:apiFile});
          scriptSrc = null;
          
          // 操作可能なtopMemoryをセット.
          var _g = {};_g[_TOP_MEMORY] = _g;
          // 上書き禁止.
          Object.defineProperty(_g, _TOP_MEMORY, {writable : false});
          var context = vm.createContext(_g);
          var scriptCall = script.runInContext(context, {filename:apiFile});
          
          // スクリプト実行.
          scriptCall(memory);
          
          // 実行成功の場合キャッシュセット.
          cacheApi.cache[apiFile] = {
            call:scriptCall,
            update: Date.now(),
            filterTime: filterTime,
            apiTime: apiTime
          };
        } catch(e) {
          removeApiCache(apiFile);
          errorApi(memory, e, status, e);
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
        headers['Last-Modified'] = toRfc822(new Date(mtime));
        if(appendHeaders != null) {
          for(var k in appendHeaders) {
            headers[k] = appendHeaders[k];
          }
        }
        // リクエストヘッダを見て、If-Modified-Sinceと、ファイル日付を比較.
        if (req.headers["if-modified-since"] != _u) {
          if (_CACHE && isCache(mtime, req.headers["if-modified-since"])) {
            
            // キャッシュの場合.
            status = 304;
            headers['Date'] = toRfc822(new Date());
            headers['Content-Length'] = bodyLength;
            
            // 返却処理.
            try {
              res.writeHead(status, headers);
              res.end(body);
            } catch(e) {
              console.debug(e);
            }
            return;
          }
        }
        // ファイル情報は非同期で読む.
        headers['Content-Length'] = stat.size;
        headers['Date'] = toRfc822(new Date());
        
        // 返却処理.
        try {
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
    try {
      res.writeHead(status, headers);
      res.end(body);
    } catch(e) {
      console.debug(e);
    }
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

  // プロセス例外ハンドラ.
  process.on('uncaughtException', function(e) {
    console.trace(e);
  });

  // promise例外ハンドラ.
  process.on('unhandledRejection', (reason) => {
    console.trace(reason);
  });

  // デフォルトのモジュールを読み込む.
  initMod.loadModules(_MODULES);

  // ポートが正しく割り当てられている場合はセット.
  var bindPort = constants.PORT;
  try {
    port = parseInt(port);
    if (port > 0 && port < 65535) {
      bindPort = port;
    }
  } catch (e) {
  }
  // タイムアウトが正しく設定されている場合はセット.
  var httpTimeout = constants.TIMEOUT;
  try {
    timeout = parseInt(timeout);
    if (timeout > 0) {
      httpTimeout = timeout;
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
  
  // コンフィグ情報を読み込む.
  _loadConfig();
  
  // サーバー生成.
  var server = createHttp(exec);
  
  // タイムアウトセット.
  server.setTimeout(httpTimeout);

  // 指定ポートで待つ.
  server.listen(bindPort);
  console.info("## listen: " + bindPort + " timeout:" + (httpTimeout/1000) + "(sec) contentCache:" + _CACHE + " pid:" + process.pid);
  server = null;
}
