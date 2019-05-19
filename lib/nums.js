// 数値系ユーティリティ.
//

module.exports = (function (_g) {
  'use strict';
  var o = {};
  var _u = undefined;

  // 指定文字の数を取得.
  var targetCharCount = function(off,src,value) {
    var ret = 0;
    var p;
    while ((p = src.indexOf(value,off)) != -1) {
      ret ++;
      off = p + value.length;
    }
    return ret;
  }

  // 数値チェック.
  // num : チェック対象の情報を設定します.
  // 戻り値 : [true]の場合、文字列情報です.
  o.isNumeric = (function() {
    var _IS_NUMERIC_REG = /[^0-9.0-9]/g;
    return function(num){
      var n = "" + num;
      if (num == null || num == _u) {
        return false;
      } else if(typeof(num) == "number") {
        return true;
      } else if(n.indexOf("-") == 0) {
        n = n.substring(1);
      }
      return !(n.length == 0 || n.match(_IS_NUMERIC_REG)) && !(targetCharCount(0,n,".")>1);
    }
  })();

  // 小数点変換処理.
  // mode : 四捨五入の場合は[true]を設定します.
  //        設定しない場合は四捨五入で処理されます.
  // n : 変換対象の情報を設定します.
  // nn : 桁数を設定します.
  // 戻り値 : 対象の数値が返却されます.
  o.parseDecimal = function(mode, n, nn) {
    if (!o.isNumeric(n)) {
      return n;
    }
    nn = nn|0
    n = parseFloat(n);
    mode = !(mode == false || mode == "false");
    if(mode) {
      var c = 0.5;
      for(var i = 0; i < nn; i ++) {
        c *= 0.1;
      }
      n += c;
    }
    var cc = 1;
    for(var i = 0; i < nn; i ++) {
      cc *= 10;
    }
    n = parseInt(n * cc);
    return n / cc;
  }
  
  // 小数点表示用.
  // ※四捨五入.
  // val : 変換対象の情報を設定します.
  // no : 桁数を設定します.
  o.halfUp = function(val, no) {
    return o.parseDecimal(true, val, no);
  }

  // 小数点表示用.
  // ※切捨て.
  // val : 変換対象の情報を設定します.
  // no : 桁数を設定します.
  o.halfDown = function(val,no) {
    return parseDecimal(false, val, no);
  }

  // 直近の小数点を切り下げて取得.
  // no 対象の番号を設定します.
  // 戻り値 : 直近の小数点が切り下げられた値が返却されます.
  o.floor = function(no) {
    return parseInt(no);
  }

  // 直近の小数点を切り上げて取得.
  // no 対象の番号を設定します.
  // 戻り値 : 直近の小数点が切り上げされた値が返却されます.
  o.round = function(no) {
    return parseInt(no + 0.5);
  }

  // 絶対値を求める.
  // no 対象の番号を設定します.
  // 戻り値 : 絶対値が返却されます.
  o.abs = function(no) {
    return parseInt((no < 0) ? (no * -1) : no);
  }

  // unix時間を取得.
  o.getTime = function() {
    return Date.now();
  }

  // ナノ時間を取得.
  o.getNanoTime = function() {
    var ret = process.hrtime()
    return ((ret[0] * 1000000000) + ret[1]);
  }

  // xor128演算乱数装置.
  o.Xor128 = function(seet) {
    var r = {v:{a:123456789,b:362436069,c:521288629,d:88675123}};
    
    // シートセット.
    r.setSeet = function(s) {
      if (o.isNumeric(s)) {
        var n = this.v;
        s = s|0;
        n.a=s=1812433253*(s^(s>>30))+1;
        n.b=s=1812433253*(s^(s>>30))+2;
        n.c=s=1812433253*(s^(s>>30))+3;
        n.d=s=1812433253*(s^(s>>30))+4;
      }
    }
    
    // 乱数取得.
    r.next = function() {
      var n = this.v;
      var t=n.a;
      var r=t;
      t = ( t << 11 );
      t = ( t ^ r );
      r = t;
      r = ( r >> 8 );
      t = ( t ^ r );
      r = n.b;
      n.a = r;
      r = n.c;
      n.b = r;
      r = n.d;
      n.c = r;
      t = ( t ^ r );
      r = ( r >> 19 );
      r = ( r ^ t );
      n.d = r;
      return r;
    }
    r.nextInt = function() {
      return this.next();
    }
    r.setSeet(seet) ;
    return r;
  }

  // ゼロサプレス.
  var _z2 = function(n) {
    return "00".substring(n.length) + n;
  }

  // 16バイトデータ(4バイト配列４つ)をUUIDに変換.
  // UUIDに変換.
  o.byte16ToUUID = function(n) {
    var a = n[0];
    var b = n[1];
    var c = n[2];
    var d = n[3];

    return _z2((((a & 0xff000000) >> 24) & 0x00ff).toString(16)) +
      _z2(((a & 0x00ff0000) >> 16).toString(16)) +
      _z2(((a & 0x0000ff00) >> 8).toString(16)) +
      _z2(((a & 0x000000ff)).toString(16)) +
      "-" +
      _z2((((b & 0xff000000) >> 24) & 0x00ff).toString(16)) +
      _z2(((b & 0x00ff0000) >> 16).toString(16)) +
      "-" +
      _z2(((b & 0x0000ff00) >> 8).toString(16)) +
      _z2(((b & 0x000000ff)).toString(16)) +
      "-" +
      _z2((((c & 0xff000000) >> 24) & 0x00ff).toString(16)) +
      _z2(((c & 0x00ff0000) >> 16).toString(16)) +
      "-" +
      _z2(((c & 0x0000ff00) >> 8).toString(16)) +
      _z2(((c & 0x000000ff)).toString(16)) +
      _z2((((d & 0xff000000) >> 24) & 0x00ff).toString(16)) +
      _z2(((d & 0x00ff0000) >> 16).toString(16)) +
      _z2(((d & 0x0000ff00) >> 8).toString(16)) +
      _z2(((d & 0x000000ff)).toString(16));
  }

  // UUIDを16バイトデータ(4バイト配列４つ)に変換.
  o.uuidToByte16 = function(n) {
    return [
      ("0x" + n.substring(0,8))|0,
      ("0x" + n.substring(9,13) + n.substring(14,18))|0,
      ("0x" + n.substring(19,23) + n.substring(24,28))|0,
      ("0x" + n.substring(28))|0
    ];
  }
  
  return o;
})(global);

