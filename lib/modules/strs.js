// 文字列系ユーティリティ.
//

module.exports = (function (_g) {
  'use strict';
  var o = {};
  var _u = undefined;

  // nullチェック.
  o.isNull = function(value) {
    return (value == _u || value == null);
  }

  // 文字存在チェック.
  o.useString = (function() {
    var _USE_STR_REG = /\S/g;
    return function(str) {
      var s = str;
      if (o.isNull(s)) {
        return false;
      }
      if (typeof(s) != "string") {
        if (!o.isNull(s["length"])) {
          return s["length"] != 0;
        }
        s = "" + s ;
      }
      return s.match(_USE_STR_REG) != _u;
    }
  })();
  
  // startWith.
  o.startsWith = function(str, chk) {
    if (o.isNull( str ) || o.isNull( chk )) {
      return false ;
    }
    return (""+str).indexOf(""+chk) == 0;
  }

  // endsWith.
  o.endsWith = function(str, chk) {
    if (o.isNull( str ) || o.isNull( chk )) {
      return false;
    }
    str = "" + str;
    chk = "" + chk;
    var p = str.lastIndexOf(chk);
    return p != -1 && p == (str.length-chk.length);
  }

  // 文字列を置き換える.
  o.changeString = function(base, src, dest) {
    if (typeof(base) != "string") {
      return base;
    }
    src = "" + src;
    dest = "" + dest;
    var old = base;
    var val = base;
    while (true) {
      val = val.replace(src,dest);
      if (old == val) {
        return val;
      }
      old = val;
    }
  }

  // 文字連結処理.
  o.StrBuf = function(s) {
    var r = {v:""};
    r.create = function(n) {
      this.v = ""+n;
      return this;
    }
    r.clear = function() {
      this.v = "";
      return this;
    }
    r.ad = function(n) {
      this.v += n;
      return this;
    }
    r.ts = function() {
      return this.v;
    }
    r.len = function() {
      return this.v.length;
    }
    if(!o.isNull(s)) {
      r.create(s);
    }
    return r;
  }

  return o;
})(global);
