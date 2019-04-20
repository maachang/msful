// 処理終了後に必ずクローズ処理を行う.
//

module.exports = (function (_g) {
  'use strict';
  var o = {};
  var list = null;
  
  o.create = function() {
    list = [];
  }
  
  o.clear = function() {
    list = null;
  }
  
  // 登録処理.
  o.register = function(n) {
    var t = typeof(n);
    // メソッドのみの指定の場合は、オブジェクトで包む.
    if(t == 'function') {
      n = {close:n}
    }
    // n = (object.close = function() {}) である必要がある.
    if(t == 'object' && typeof(n['close']) == 'function') {
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
})(global);
