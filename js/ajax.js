// ajax.
//

if(!window["global"]) {
  window["global"] = window;
}

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
(function(_g) {
  'use strict';
  var _u = undefined;
  var http_client = (function(){
    var head = function(m,x,h){
      if(!h["Content-Type"]) {
        if(m=='POST') {
          x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        else if(m=='JSON') {
          x.setRequestHeader('Content-Type', 'application/json');
        }
      }
      if(h) {
        for(var k in h) {
          // コンテンツ長は設定すると警告が出るので居れない.
          if(k != "Content-Length") {
            x.setRequestHeader(k,h[k]);
          }
        }
      }
    }
    var _m=function(m) {
      return m == 'JSON' ? 'POST' : m;
    }
    
    return function(method ,url, option, func, errFunc) {
      if(!option) {
        option = {};
      }
      var params = option.params
      var noCache = option.params
      var header = option.params
      errFunc = (typeof(errFunc) != "function") ? func : errFunc;
      method = (method+"").toUpperCase() ;
      if(noCache != true) {
        url += (( url.indexOf( "?" ) == -1 )? "?":"&" )+(new Date().getTime()) ;
      }
      var pms = "" ;
      if( params ) {
        if( typeof( params ) == "string" ||
          params instanceof Blob || params instanceof File ||
          params instanceof Uint8Array || params instanceof ArrayBuffer) {
          pms = params ;
        }
        else {
          var cnt = 0;
          for( var k in params ) {
            if(cnt != 0) {
              pms += "&";
            }
            pms += k + "=" + encodeURIComponent( params[ k ] ) ;
            cnt ++;
          }
        }
      }
      if( method == "GET" ) {
        url += pms ;
        pms = null ;
      }
      // 同期Ajax.
      if( func == _u ) {
        var x = new XMLHttpRequest();
        x.open(_m(method),url,false);
        head(method,x,header);
        x.send(pms);
        var state = x.status;
        if(state == 0) {
            state = 500;
        }
        var ret = x.responseText;
        x.abort() ;
        if(state < 300) {
            return ret ;
        }
        throw new Error("response status:" + state + " error");
      }
      // 非同期Ajax.
      else {
        var x = new XMLHttpRequest();
        x.open(_m(method),url,true);
        x.onload = function(){
          if(x.readyState==4) {
            try {
              var status = x.status;
              if(!status || status == 0) {
                status = 500;
              }
              if( status < 300 ) {
                func(status,x.responseText) ;
              } else {
                errFunc(status,x.responseText) ;
              }
            } finally {
              x.abort() ;
              x = null;
              func = null;
              errFunc = null;
            }
          }
        };
        x.onerror = function() {
          var status = x.status;
          if(!status || status == 0) {
            status = 500;
          }
          try {
            errFunc(status,x.responseText ) ;
          } finally {
            x.abort() ;
            x = null;
            func = null;
            errFunc = null;
          }
        }
      }
      head(method,x,header);
      x.send(pms);
    };
  })() ;

  global.http_client = http_client
})(global);