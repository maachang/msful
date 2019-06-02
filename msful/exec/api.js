// API実行処理.
//
//

module.exports.create = function (_g, core, notCache, closeFlag) {
  'use strict';
  var _u = undefined
  var fs = require('fs');
  var vm = require('vm');
  var path = require('path');
  var constants = require("../constants");
  var u = require("../../lib/u");
  var caches = require("../../lib/subs/caches");

  // システムロガー.
  var log = msfulLogger().get("system");

  // httpCore処理.
  var httpCore = require('../http_core');

  // エラーハンドリング.
  var error = require("../error");

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
  
  //
  // キャッシュ情報.
  //

  // APIキャッシュ時間系.
  var _CACHE_API_CHECK_TIME = 60000;  // 60秒.
  var _CACHE_API_REMOVE_TIME = 300000; // 300秒.

  // requireCache時間系.
  var CHECK_TIME = 15000;  // 15秒.
  var REMOVE_TIME = 60000; // 60秒.

  // キャッシュ情報.
  var cacheApi = caches.create(_CACHE_API_CHECK_TIME, _CACHE_API_REMOVE_TIME);
  var rtxScriptCache = caches.create(_CACHE_API_CHECK_TIME, _CACHE_API_REMOVE_TIME);
  var cacheRequire = caches.create(CHECK_TIME, REMOVE_TIME);
  var backupRequire = caches.create(CHECK_TIME, REMOVE_TIME);

  // パラメータ取得.
  var _$getParams = function (request, data) {
    if (request.method.toLowerCase() == "post") {
      return _$post(request, data);
    } else {
      return _$get(request.url);
    }
  }

  // POSTパラメータ処理.
  var _$post = function (req, data) {
    // バッファデータの場合.
    if(data instanceof Buffer) {
      return data;
    // Uint8Arrayデータの場合.
    } else if(data instanceof Uint8Array) {
      return Buffer.from(data);
    // json系の場合.
    } else if (req.headers["content-type"].indexOf("application/json") == 0) {
      // /jsonが含まれる場合はjson変換.
      return JSON.parse(data);
    } else if (typeof(data) == "string") {
      // 文字列の場合はQueryパラメータ変換.
      return _analysisParams(data);
    } else {
      // それ以外はそのまま返却.
      return data;
    }
  }

  // GETパラメータを処理.
  var _$get = function (url) {
    var p = url.indexOf("?");
    if (p == -1) {
      return {};
    }
    return _analysisParams(url.substring(p + 1));
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
  
  // スクリプト送信終了チェック.
  var _endSendScript = function(m) {
    var ret = true;
    try {
      ret = !("response" in m) ||
        (!(_EXIT_SEND_SCRIPT_FLG in m) &&
          m[_EXIT_SEND_SCRIPT_FLG]) ||
        (!(_EXIT_SEND_ERROR_SCRIPT_FLG in m) &&
          m[_EXIT_SEND_ERROR_SCRIPT_FLG]);
    } catch(e) {
      log.warn("exception", e);
    }
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
      log.debug("exception", e);
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

  // [binary]正常戻り値処理.
  var _successBinary = function(m, status, body, charset) {
    if (_endSendScript(m)) {
      return false;
    }
    // bodyが文字列の場合はBufferに変換.
    if (body instanceof String) {
      if(!charset || charset == "") {
        charset = "uft-8";
      }
      body = Buffer.from(body, charset);
    // Uint8Arrayの場合は、バッファ変換.
    } else if(body instanceof Uint8Array) {
      body = Buffer.from(body);
    }
    // bodyがBufferでない場合は、エラー.
    if (!(body instanceof Buffer)) {
      throw new Error("The body data is not in binary format.");
    }
    // cros対応ヘッダを設定.
    var headers = m.headers;
    httpCore.setCrosHeader(headers, body.length, notCache, closeFlag);

    // cros対応ヘッダを設定.
    return _send(m, status, body);
  }
  
  // [webApi]正常戻り値処理.
  var _successApi = function(m, status, body) {
    if (_endSendScript(m)) {
      return false;
    }
    var headers = m.headers;
    httpCore.setCrosHeader(headers, httpCore.utf8Length(body), notCache, closeFlag);
    headers['Content-Type'] = 'application/json; charset=utf-8;';
    
    // 返却処理.
    return _send(m, status, body);
  }
  
  // [webapi]エラー処理.
  var _errorApi = function(m, e, status, trace) {
    if (_endSendScript(m)) {
      return false;
    }
    var message = "";
    if (e) {
      // httpErrorハンドリング.
      if (e["status"]) {
        status = e["status"]|0;
        if(e["message"]) {
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
      if(core.getSysParams().getDebugMode() || status >= 500) {
        error.error("http_error: status: " + status + " message: " + message, trace);
      }
    } else if(status >= 500) {
      log.error("http_error: status: " + status + " message: " + message);
    }
    var headers = m.headers;
    var body = "{\"result\": \"error\", \"error\": " + status + ", \"message\": \"" + message + "\"}";
    httpCore.setCrosHeader(headers, httpCore.utf8Length(body), notCache, closeFlag);
    headers['Content-Type'] = 'application/json; charset=utf-8;';

    // 返却処理.
    return _send(m, status, body);
  }

  // エラー処理(readApi外でエラー処理を呼び出す場合)
  var _outError = function(res, e, status, trace, headers) {
    return _errorApi({
      response: res,
      headers: (!headers) ? {} : headers
    }, e, status, trace);
  }

  // Respオブジェクト.
  var ResponseContext = function(mm) {
    this._m = mm;
    this._promise = false;
    this._sendBuffer = null;
  }
  
  // 次の実行処理をセット.
  ResponseContext.prototype.push = function(call) {
    // 処理対象がfnctionコールでない場合.
    var t = typeof(call);
    if(t != "function") {

      // 代わりにファイル名で設定されている場合.
      if(t == "string") {
        try {

          // キャッシュに情報が存在するかチェック.
          var cache = rtxScriptCache.getCache(call);
          var mtime = fs.statSync(call).mtime;
          if(cache != null && cache,lastModified === mtime) {

            // キャッシュに存在する場合はそれを利用する.
            call = cache.call;
          } else {

            // 対象ファイルをオープン.
            var value = fs.readFileSync(call, "utf-8");

            // ファイル内容をFunction変換.
            // フィルタセット.
            value = "function(rtx) {\n" + value + "\n})";
            var  name = call;
            call = new Function(value);
            value = null;

            // キャッシュにセット.
            rtxScriptCache.put(name, mtime, call)
          }
        } catch(e) {
          _errorApi(this._m, e, 500, e);
          rtxScriptCache.remove(call);
        }
      }
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
        body: body
      }
      return "OK";
    }
    try {
      m.response.statusCode = status;
      _successApi(m, status, JSON.stringify(body));
    } catch(e) {
      log.debug("exception", e);
    } finally {
      _closeable(m);
    }
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
      _successBinary(m, status, body, charset);
    } catch(e) {
      log.debug("exception", e);
    } finally {
      _closeable(m);
    }
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
      log.debug("exception", e);
    } finally {
      _closeable(m);
    }
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
        _errorApi(m, e, status, e);
      } else {
        _errorApi(m, {status: status, message: message}, status, e);
      }
    } catch(ee) {
      log.debug("exception", ee);
    } finally {
      this._sendBuffer = null;
      _closeable(m);
    }
  };

  // 例外出力時に呼び出す.
  ResponseContext.prototype.exception = function(e, status) {
    var m = this._m;
    status = status|0;
    if(status <= 0) {
      status = 500;
    }
    try {
      _errorApi(m, e, status, e);
    } catch(ee) {
      log.debug("exception", ee);
    } finally {
      this._sendBuffer = null;
      _closeable(m);
    }
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
  var _endRtx = function(m) {
    if(m.rtx._promise) {
      var buf = m.rtx._sendBuffer;
      m.rtx._sendBuffer = null;
      if(buf == null) {
        // 送信条件が存在しない場合は、空データを送信.
        buf = { type: -1 };
      }
      try {
        switch(buf.type) {
          case 1:
            m.response.statusCode = buf.status;
            _successApi(m, buf.status, JSON.stringify(buf.body));
            return "OK";
          case 2:
            m.response.statusCode = buf.status;
            _successBinary(m, buf.status, buf.body, buf.charset);
            return "OK";
          case 3:
            m.response.statusCode = buf.status;
            m.headers['Location'] = buf.url;
            m.rtx.success("", buf.status);
            return "OK";
          default:
            // 何も返す情報がない場合は空を返す
            m.response.statusCode = 200
            _successApi(m, 200, '{}');
            return "OK";
        }
      } catch(e) {
        log.debug("exception", e);
      } finally {
        _closeable(m);
      }
    } else {
      return "NONE";
    }
  }

  // エラー.
  var _error = function(mm) {
    var _m = mm; mm = null;
    return function(e, status, err) {
      try {
        return _errorApi(_m, e, status, (err == _u) ? e: err);
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
          return _errorApi(_m, e, status, e);
        } else {
          return _errorApi(_m, {status: status, message: message}, status, e);
        }
      } catch(ee) {
        log.debug("exception", ee);
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
    core.clearModules();
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
        var im = m; m = null;
        var icall = call; call = null;
        var iargs = args; args = null;
        try {
          icall.apply(null, iargs);
        } catch(e) {
          _catchsByAsync(e, im);
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
        var im = m; m = null;
        var icall = call; call = null;
        var iargs = args; args = null;
        try {
          icall.apply(null, iargs);
        } catch(e) {
          _catchsByAsync(e, im);
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
        var im = m; m = null;
        var icall = call; call = null;
        var iargs = args; args = null;
        try {
          icall.apply(null, iargs);
        } catch(e) {
          _catchsByAsync(e, im);
        }
      },time);
    }
  }

  // コンソール出力.
  var _print = function(n) {
    process.stdout.write(n + "\n");
  }

  // モジュールをセット.
  var setModules = function(out) {
    core.setDefaultModules(out);
    var modules = core.getModules();
    for(var k in modules) {
      out[k] = modules[k];
    }

    // グローバルメモリにmsful固有条件をセット.
    core.setMsfulGlobals(out);
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
    memory.params = _$getParams(req, data);
    
    // キャッシュApiオブジェクト.
    memory.cacheApi = cacheApi;

    // レスポンスコンテキスト終了処理.
    memory._endRtx = _endRtx;

    // エラーハンドリング.
    memory._error = _error(memory);

    // サーバエラー処理.
    memory._serverError = _serverError(memory);

    // コンソール出力.
    memory.print = _print;

    // HttpErrorハンドラ.
    memory.HttpError = error.HttpError;

    // ResponseContext処理.
    memory.rtx = new ResponseContext(memory);

    // promise.
    memory.rtx.$ = function() {
      memory.rtx._promise = true;
      return new Promise(function(resolve) {
        resolve(memory.rtx)
      })
    }
    
    // 拡張require.
    memory.require = Object.freeze(
      require("../require")(cacheRequire, backupRequire, core)
    );

    // タイマー系.
    // try catch を入れて、エラーハンドリング時にHTTPレスポンスを返却.
    memory.setImmediate = _setImmediate(memory);
    memory.setInterval = _setInterval(memory);
    memory.setTimeout = _setTimeout(memory);
    
    // 初期化が必要な処理を実行.
    core.createModules(req, res, memory.params);

    return memory;
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
      _errorApi(memory, e, status, e);
    }
  }

  // api読み込み.
  var readApi = function(req, res, data, url) {
    
    // キャッシュチェック.
    cacheApi.cacheControll();
    rtxScriptCache.cacheControll();
    
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

          // エラー処理.
          if (err) throw err;
          
          // 初期化.
          var memory = createMemory(req, res, data);
          var status = 200;
          
          // APIファイル時間を取得.
          apiTime = stat.mtime.getTime();
          
          // フィルタなしの実行処理.
          var filterSrc = "rtx.next();\n";
          
          // フィルタが存在する場合.
          if (!ferr) {
            filterTime = fstat.mtime.getTime();
            
            // キャッシュデータを取得.
            var cache = cacheApi.getCache(apiFile);
            
            // [フィルタあり]キャッシュ実行可能かチェック.
            if(cache != _u && cache.filterTime == filterTime && cache.apiTime == apiTime) {
              cache.update = Date.now();
              executeCacheApi(apiFile, req, res, data, cache);
              return;
            }
            cache = null;
            
            // フィルタセット.
            filterSrc = "(function() {\n" +
              fs.readFileSync(filterName, "utf-8") +
            "\n})();\n";
          
          // フィルタが存在しない場合.
          } else {
            
            // キャッシュデータを取得.
            var cache = cacheApi.getCache(apiFile);
            
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
                  "result.then(function() { return _endRtx(rtx._m) });" +
                  "result.catch(function(e) {\n" +
                    "_error(e);\n" +
                  "});\n" +
                "\n}" +
              "\n} catch(e) {\n" +
                // ここで落ちる場合は、シンタックスエラー(文法系エラー)なので、
                // キャッシュ削除と、closeableが動かないエラー返却を行う.
                "cacheApi.remove(_api_name);\n" +
                "_error(e);\n" +
              "} finally {\n" +
              
                // unhandledRejection の例外ハンドリングクリア(EventEmitterの上限を超えるので、現状除外).
                "//if (_ur != null) {\n" +
                  "//try { process.removeEventLister('unhandledRejection', _ur); } catch(ee){}\n" +
                "//}\n" +
              "}\n" +
            "}\n" +
          "})();";
          filterSrc = null;
          
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
          cacheApi.put(apiFile, 0, scriptCall, {
            filterTime: filterTime,
            apiTime: apiTime
          });
        } catch(e) {
          cacheApi.remove(apiFile);
          _errorApi(memory, e, status, e);
        }
      });
    });
  }

  var o = {};

  // 実行処理.
  var _exec = async function(req, res, url, data) {
    setImmediate(function() {
      var rq = req; req = null;
      var rs = res; res = null;
      try {
        var d = data; data = null;
        var u = url; url = null;
        readApi(rq, rs, d, u);
      } catch(e) {
        _outError(rs, e);
      }
    })
  }

  // API実行.
  o.execute = function(req, res, url, data) {

    // アクセス禁止URL.
    if (url.indexOf(constants.FORBIDDEN_URL) != -1) {
      // アクセス禁止.
      _outError(res, {status: 403, message: "error: 403"}, 403);
      return false;
    }
    
    // WebAPIのパスチェック.
    if(!httpCore.checkPath(constants.API_PATH, baseApiPath, url, res)) {
      _outError(res, {status: 403, message: "It is an illegal URL."}, 403);
      return false;
    }
    
    // WebApi返却(非同期).
    _exec(req, res, url, data);
    return true;
  }

  return o;
};
