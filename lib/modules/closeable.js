// 処理終了後に必ずクローズ処理を行う.
//

exports.createCloseable = function () {
  'use strict';
  var o = {};
  var list = [];
  
  // 登録処理.
  o.register = function(n) {
    // n = (object.close = function() {}) である必要がある.
    if(typeof(n) == 'object' && typeof(n['close']) == 'function') {
      list.push(n);
      return o;
    }
    throw new Error("It is not an object or there is no close method.");
  }
  
  // 登録内容を全てクローズ.
  o.close = function() {
    var lst = list;
    var len = lst.length;
    if(len > 0) {
      list = [];
      for(var i = 0; i < len; i ++) {
        try {
          lst[i].close();
        } catch(e) {}
      }
    }
  }
  
  return o;
}