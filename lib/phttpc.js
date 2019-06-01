// http_clientをpromise対応.
//
// phttpc.get(options) by get method.
// phttpc.post(options) by post method(form).
// phttpc.json(options) by json method(json).
// phttpc.put(options) by put method.
// phttpc.delete(options) by delete method.
// phttpc.client(method, options).
//
// options: 以下がオプションで設定できます.
//          url : 接続先URL.
//          body : ボディデータ.
//          headers : ヘッダ情報.
//
// Promise()
//  then({status, body, headers})
//  catch({status, body, headers})
//
//  status: レスポンスHTTPステータス.
//  body: レスポンスボディ.
//  headers: レスポンスヘッダ.
//

module.exports = (function () {
  'use strict';

  // ヘッダで処理させる.
  var _NOT_CACHE = false;

  // httpクライアント.
  var httpc = require("./http_client");

  // promise対応版 http client.
  var _promiseHttpClient = function(method, options) {
    var url = options.url;
    var params = options.body;
    var headers = options.headers;

    // httpClient用のオプション変換.
    var opt = {
      params: params,
      headers: headers,
      noCache: _NOT_CACHE
    };
    return new Promise(function(resolve, reject) {
      httpc(method, url, opt,
        function(status, body, headers) {
          // 正常系.
          resolve({status: status, body: body, headers: headers});
        },
        function(status, body, headers) {
          // エラー系.
          reject({status: status, body: body, headers: headers});
        }
      )
    });
  }

  var o = {};

  // get method.
  o.get = function(options) {
    return _promiseHttpClient("GET", options);
  }

  // post method(form).
  o.post = function(options) {
    return _promiseHttpClient("POST", options);
  }

  // post method(json).
  o.json = function(options) {
    return _promiseHttpClient("JSON", options);
  }

  // put method.
  o.put = function(options) {
    return _promiseHttpClient("PUT", options);
  }

  // delete method.
  o.delete = function(options) {
    return _promiseHttpClient("DELETE", options);
  }

  // httpClient.
  o.client = function(method, options) {
    return _promiseHttpClient(method, options);
  }

  return o;
})();

