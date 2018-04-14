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
  // strFlag : 文字列で返却する場合は[true]をセットします.
  // mode : 四捨五入の場合は[true]を設定します.
  //        設定しない場合は四捨五入で処理されます.
  // n : 変換対象の情報を設定します.
  // nn : 桁数を設定します.
  // 戻り値 : 対象の数値が返却されます.
  o.parseDecimal = function(strFlag, mode, n, nn) {
    strFlag = ( strFlag == true || strFlag == "true" ) ;
    if (!o.isNumeric(n)) {
      return n;
    }
    mode = !(mode == false || mode == "false");
    n = parseFloat(n);
    if (typeof(nn) == "number" || o.isNumeric(nn)) {
      var keta = nn = (nn|0);
      if (nn < 1) {
        return strFlag ? ""+(n|0) : n|0;
      }
      var cc = 1 ;
      for (var i = 0 ; i < nn ; i ++) {
        cc *= 10.0;
      }
      n = n * cc;
      // 四捨五入
      if (mode) {
        nn = parseFloat( n|0 );
        nn = n - nn;
        if (nn >= 0.5) {
          n = parseFloat((n + 1)|0);
        }
        else {
          n = parseFloat(n|0);
        }
      }
      // 切捨て.
      else {
        n = parseFloat(n|0);
      }
      n = n / cc;
      var c;
      var x = "" + n;
      var p = x.indexOf( "." );
      if (p != -1) {
        var pp = x.length;
        for (var i = x.length-1 ; i >= p ; i --) {
          c = x.substring( i,i+1 );
          if (c == "0") {
            pp = i;
          } else if (c == ".") {
            pp = p;
            break;
          } else {
            break;
          }
        }
        if (pp != x.length) {
          x = x.substring(0,pp);
        }
        if ((p = x.indexOf( "." )) == -1) {
          x = x + ".";
          for (var i = 0 ; i < keta ; i ++) {
            x += "0";
          }
          return strFlag ? x : parseFloat(x);
        } else if (x.length - p < keta) {
          nn = x.length - p;
          for (var i = 0 ; i < nn ; i ++) {
            x += "0";
          }
          return strFlag ? x : parseFloat(x);
        }
        return strFlag ? x : parseFloat(x);
      }
    }
    return n ;
  }
  
  // 小数点表示用.
  // ※四捨五入.
  // val : 変換対象の情報を設定します.
  // no : 桁数を設定します.
  o.halfUp = function(val, no) {
    return o.parseDecimal(true, true, val, no);
  }

  // 小数点表示用.
  // ※切捨て.
  // val : 変換対象の情報を設定します.
  // no : 桁数を設定します.
  o.halfDown = function(val,no) {
    return parseDecimal(true, false, val, no);
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
    return (no < 0) ? (no * -1) : no;
  }

  // 32ビットフラグの生成.
  o.createFlag32 = function(list, off) {
    off = off|0;
    var ret = 0;
    for (var i = 0 ; i < 32; i ++) {
      ret |= (list[i+off] == true ? 1 : 0) << i;
    }
    return ret;
  }

  // 32ビットフラグ情報を取得.
  o.getFlag32 = function(code) {
    var ret = new Array(32);
    for (var i = 0 ; i < 32 ; i ++) {
      ret[ i ] = (low & ( 1 << i )) != 0;
    }
    return ret;
  }

  // 32ビットフラグ情報の部分取得.
  o.flag32 = function(code, no) {
    return (low & ( 1 << (no|0) )) != 0;
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

  return o;
})(global);

