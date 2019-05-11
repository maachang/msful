// ajax.
//

if(!window["global"]) {
  window["global"] = window;
}

////////////////////////////////////////////////////////////////////////////////
// 通常Ajax処理.
// method : POST or GET.
// URL : 接続先URL.
// params : パラメータ設定(Map定義).
// func : コールバックファンクション.
//        コールバックファンクションを設定しない場合は、同期取得(非推奨).
// errorFunc : エラー発生時のコールバックファンクション.
// noCache : キャッシュなしの場合は[true].
// header : ヘッダ情報.
// 
// 比較的古いブラウザ(IE8)でも動作するように作られています.
////////////////////////////////////////////////////////////////////////////////
(function(_g) {
  'use strict';
  var _u = undefined;

  // ajaxメソッド.
  var _ajax = (function(){

    // MS向けActiveXオブジェクト利用可能チェック.
    var _IA = 'Msxml2.XMLHTTP';
    var _IA_LIST = [_IA+".6.0", _IA+".3.0", _IA];
    var _IA_LIST_LENGTH = _IA_LIST.length;
    var _IA_NAME = "";
    var _IE = false ;
    var _XDOM = false ;
    (function(){
      for(var i = 0; i < _IA_LIST_LENGTH; i ++) {
        try {
          new ActiveXObject(_IA_LIST[i]) ;
          _IA_NAME = _IA_LIST[i];
          _IE = true ;
          break;
        } catch(e) {}
      }
      if(_IE) {
        try {
          new XDomainRequest() ;
          _IE = true ;
          _XDOM = true ;
        } catch(ee) {
        }
      }
    })();

    // ajaxオブジェクトを取得.
    var ax =(function(){
      var a;
      // 基本ブラウザ全般.
      try {
        a = new XMLHttpRequest() ;
        a = function() { return new XMLHttpRequest(); }
      } catch(e) {
        // IEの場合.
        if(_IE) {
          if(_IA_NAME.length > 0) {
            a = function() { return new ActiveXObject(_IA_NAME); };
          } else {
            a = function() { return new ActiveXObject("Microsoft.XMLHTTP"); }
          }
          if(_XDOM) {
            return function(d) {
              if(d == 1) {
                var n = new XDomainRequest() ;
                n.ie = 0 ;
                return n ;
              }
              return a() ;
            }
          }
        // IE以外の場合. 
        } else {
          throw e;
        }
      }
      return a ;
    })();
    
    // ヘッダセット.
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
          if(k != "Content-Length") {
            x.setRequestHeader(k,h[k]);
          }
        }
      }
    }

    // method変換.
    var _m=function(m) {
      return m == 'JSON' ? 'POST' : m;
    }
    
    // 処理メソッド返却.
    return function(method ,url, params, func, errFunc, noCache, header) {
      errFunc = (typeof(errFunc) != "function") ? func : errFunc;
      method = (method+"").toUpperCase() ;
      if(noCache != true) {
        url += (( url.indexOf( "?" ) == -1 )? "?":"&" )+(new Date().getTime()) ;
      }
      var pms = "" ;
      if(params) {
        if(typeof( params ) == "string" ||
          params instanceof Blob || params instanceof File ||
          params instanceof Uint8Array || params instanceof ArrayBuffer) {
          pms = params ;
        }
        else {
          var cnt = 0;
          for( var k in params) {
              if(cnt != 0) {
                  pms += "&";
              }
              pms += k + "=" + encodeURIComponent( params[ k ] ) ;
              cnt ++;
          }
        }
      }
      if(method == "GET") {
        url += pms ;
        pms = null ;
      }
      if(func == _u) {
        var x=ax();
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
      else {
        var x = ax((/^https?:\/\//i.test(url))?1:0);
        if(x.ie == 0) {
          x.onprogress = function() {}
          x.onload = function() {
            try {
              var status = x.status;
              if(!status || status == 0) {
                status = 500;
              }
              if(status < 300) {
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
          x.onerror = function() {
            var status = x.status;
            if(!status || status == 0) {
              status = 500;
            }
            try {
              errFunc(status,x.responseText) ;
            } finally {
              x.abort() ;
              x = null;
              errFunc = null;
            }
          }
          x.open(_m(method),url);
        }
        else {
          x.open(_m(method),url,true);
          if(ie) {
            x.onreadystatechange=function(){
              if(x.readyState==4) {
                  try {
                    var status = x.status;
                    if(!status || status == 0) {
                      status = 500;
                    }
                    if(status < 300) {
                      func(status,x.responseText);
                    } else {
                      errFunc(status,x.responseText);
                    }
                  } finally {
                    x.abort() ;
                    x = null;
                    func = null;
                    errFunc = null;
                  }
                }
            };
          }
          else {
              x.onload = function(){
                if(x.readyState==4) {
                  try {
                    var status = x.status;
                    if(!status || status == 0) {
                      status = 500;
                    }
                    if(status < 300) {
                      func(status,x.responseText);
                    } else {
                      errFunc(status,x.responseText);
                    }
                  } finally {
                    x.abort();
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
                  errFunc = null;
                  x.abort() ;
                  x = null;
                }
              }
          };
        }
        head(method, x, header);
        x.send(pms);
      }
    };
  })();

  global.ajax = _ajax
})(global);