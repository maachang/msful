// 軽量暗号化・符号化.
//
if(!window["global"]) {
  window["global"] = window;
}

(function(_g) {
"use strict";

// undefined定義.
var _u = undefined ;

// CustomBase64.
var CBase64 = (function() {
  var o = {};
  var EQ = '=';
  var ENC_CD = "0123456789+abcdefghijklmnopqrstuvwxyz/ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var DEC_CD = (function() {
    var src = ENC_CD;
    var ret = {};
    var len = src.length;
    for(var i = 0; i < len; i ++) {
      ret[src[i]] = i;
    }
    return ret;
  })();
  o.encode = function(bin) {
    var i, j, k;
    var allLen = allLen = bin.length ;
    var etc = (allLen % 3)|0;
    var len = (allLen / 3)|0;
    var ary = new Array((len * 4) + ((etc != 0) ? 4 : 0));
    for (i = 0, j = 0, k = 0; i < len; i++, j += 3, k += 4) {
      ary[k] = ENC_CD[((bin[j] & 0x000000fc) >> 2)];
      ary[k + 1] = ENC_CD[(((bin[j] & 0x00000003) << 4) | ((bin[j+1] & 0x000000f0) >> 4))];
      ary[k + 2] = ENC_CD[(((bin[j+1] & 0x0000000f) << 2) | ((bin[j+2] & 0x000000c0) >> 6))];
      ary[k + 3] = ENC_CD[(bin[j+2] & 0x0000003f)];
    }
    switch (etc) {
    case 1:
      j = len * 3;
      k = len * 4;
      ary[k] = ENC_CD[((bin[j] & 0x000000fc) >> 2)];
      ary[k + 1] = ENC_CD[((bin[j] & 0x00000003) << 4)];
      ary[k + 2] = EQ;
      ary[k + 3] = EQ;
      break;
    case 2:
      j = len * 3;
      k = len * 4;
      ary[k] = ENC_CD[((bin[j] & 0x000000fc) >> 2)];
      ary[k + 1] = ENC_CD[(((bin[j] & 0x00000003) << 4) | ((bin[j+1] & 0x000000f0) >> 4))];
      ary[k + 2] = ENC_CD[(((bin[j+1] & 0x0000000f) << 2))];
      ary[k + 3] = EQ;
      break;
    }
    return ary.join('');
  }
  o.decode = function(base64) {
    var i, j, k;
    var allLen = base64.length ;
    var etc = 0 ;
    for (i = allLen - 1; i >= 0; i--) {
      if (base64.charAt(i) == EQ) {
        etc++;
      } else {
        break;
      }
    }
    var len = (allLen / 4)|0;
    var ret = new Uint8Array((len * 3) - etc);
    len -= 1;
    for (i = 0, j = 0, k = 0; i < len; i++, j += 4, k += 3) {
      ret[k] = (((DEC_CD[base64[j]] & 0x0000003f) << 2) | ((DEC_CD[base64[j+1]] & 0x00000030) >> 4));
      ret[k + 1] = (((DEC_CD[base64[j+1]] & 0x0000000f) << 4) | ((DEC_CD[base64[j+2]] & 0x0000003c) >> 2));
      ret[k + 2] = (((DEC_CD[base64[j+2]] & 0x00000003) << 6) | (DEC_CD[base64[j+3]] & 0x0000003f));
    }
    switch (etc) {
    case 0:
      j = len * 4;
      k = len * 3;
      ret[k] = (((DEC_CD[base64[j]] & 0x0000003f) << 2) | ((DEC_CD[base64[j+1]] & 0x00000030) >> 4));
      ret[k + 1] = (((DEC_CD[base64[j+1]] & 0x0000000f) << 4) | ((DEC_CD[base64[j+2]] & 0x0000003c) >> 2));
      ret[k + 2] = (((DEC_CD[base64[j+2]] & 0x00000003) << 6) | (DEC_CD[base64[j+3]] & 0x0000003f));
      break;
    case 1:
      j = len * 4;
      k = len * 3;
      ret[k] = (((DEC_CD[base64[j]] & 0x0000003f) << 2) | ((DEC_CD[base64[j+1]] & 0x00000030) >> 4));
      ret[k + 1] = (((DEC_CD[base64[j+1]] & 0x0000000f) << 4) | ((DEC_CD[base64[j+2]] & 0x0000003c) >> 2));
      break;
    case 2:
      j = len * 4;
      k = len * 3;
      ret[k] = (((DEC_CD[base64[j]] & 0x0000003f) << 2) | ((DEC_CD[base64[j+1]] & 0x00000030) >> 4));
      break;
    }
    return ret;
  }
  return o;
})();

// 指定文字の数を取得.
var _targetCharCount = function(off,src,value) {
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
var _isNumeric = (function() {
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
    return !(n.length == 0 || n.match(_IS_NUMERIC_REG)) && !(_targetCharCount(0,n,".")>1);
  }
})();

// xor128演算乱数装置.
var _Xor128 = function(seet) {
  var r = {v:{a:123456789,b:362436069,c:521288629,d:88675123}};
  
  // シートセット.
  r.setSeet = function(s) {
    if (_isNumeric(s)) {
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

// 基本セット.
var fcipher = {};
var _head = null;
var rand = _Xor128(new Date().getTime());
fcipher.CBase64 = CBase64;

// ヘッダデータをセット.
fcipher.head = function(h) {
  _head = h;
}

// 指定文字列を保証するキーを生成.
fcipher.key = function(word, src) {
  if(src == _u || src == null) {
    src = "-l_l-u_f-s_m-";
  }
  var srcBin = code16(src, 1) ;
  var wordBin = code16(word, 1) ;
  var ret = srcBin.concat(wordBin) ;
  for( var i = 0 ; i < 16 ; i ++ ) {
      ret[ i ] = _convert( ret, i, wordBin[ i ] ) ;
  }
  for( var i = 15,j = 0 ; i >= 0 ; i --,j ++ ) {
      ret[ i+16 ] = _convert( ret, i+16, srcBin[ j ] ) ;
  }
  return ret ;
}

// エンコード.
fcipher.enc = function(value, pKey, head) {
    return fcipher.benc(strToArray( ""+value ), pKey, head) ;
}

// バイナリエンコード.
fcipher.benc = function(bin, pKey, head) {
  head = head == null || head == _u ? ((_head == null) ? "" : _head) : head;
  // 第一引数がバイナリ.
  var pubKey = _randKey() ;
  var key32 = _convertKey(pKey, pubKey) ;
  var key256 = _key256(key32) ;
  key32 = null ;
  var stepNo = _getStepNo(pKey, bin) & 0x0000007f ;
  var nowStep = _convert256To(key256, pubKey, stepNo) ;
  _ed(true, bin, key256, nowStep) ;
  var eb = new Uint8Array(34+bin.length) ;
  eb[ 0 ] = rand.nextInt() & 0x000000ff;
  eb[ 1 ] = (~(stepNo^eb[ 0 ])) ;
  arraycopy(pubKey, 0, eb, 2, 32) ;
  arraycopy(bin, 0, eb, 34, bin.length) ;
  return head + CBase64.encode(eb);
}

// デコード.
fcipher.dec = function(value, pKey, head) {
  return aryToString(fcipher.bdec(value, pKey, head)) ;
}

// バイナリデコード.
fcipher.bdec = function(value, pKey, head) {
  head = head == null || head == _u ? ((_head == null) ? "" : _head) : head;
  var bin = CBase64.decode(value.substring(""+head.length));
  if( bin.length <= 34 ) {
    throw new Error("decode:Invalid binary length.") ;
  }
  var stepNo = ((~(bin[ 1 ]^bin[0]))&0x0000007f) ;
  var pubKey = new Uint8Array(32) ;
  arraycopy(bin, 2, pubKey, 0, 32) ;
  var bodyLen = bin.length - 34 ;
  var body = new Uint8Array(bodyLen) ;
  arraycopy(bin, 34, body, 0, bodyLen) ;
  bin = null ;
  var key32 = _convertKey(pKey, pubKey) ;
  var key256 = _key256(key32) ;
  key32 = null ;
  var nowStep = _convert256To(key256, pubKey, stepNo) ;
  _ed(false, body, key256, nowStep) ;
  var destStepNo = _getStepNo(pKey, body) & 0x0000007f;
  if( destStepNo != stepNo ) {
    throw new Error("decode:Decryption process failed.");
  }
  return body;
}

// ランダムキー生成.
var _randKey = function() {
  var bin = new Uint8Array(32) ;
  for( var i = 0 ; i < 32 ; i ++ ) {
    bin[ i ] = ( rand.next() & 0x000000ff ) ;
  }
  return bin ;
}

// コード16データを作成.
// s 処理対象情報.
// mode
//   1 : string
//   それ以外: 配列.
var code16 = function(s, mode) {
  var ret = mode == 1 ?
    [177, 75, 163, 143, 73, 49, 207, 40, 87, 41, 169, 91, 184, 67, 254, 89] :
    [87, 41, 169, 91, 184, 67, 254, 89, 177, 75, 163, 143, 73, 49, 207, 40] ;
  var n;
  var len = s.length;
  mode = mode|0;
  for(var i = 0; i < len; i ++) {
    n = (mode==1 ? s.charCodeAt(i)|0 : s[i]|0) & 0x00ffffff;
    if((i&0x00000001) == 0) {
      for(var j = 0; j < 16; j+= 2) {
        ret[j] = ret[j] ^ (n-(i+j));
      }
      for(var j = 1; j < 16; j+= 1) {
        ret[j] = ret[j] ^ ~(n-(i+j));
      }
    }
    else {
      for(var j = 1; j < 16; j+= 1) {
        ret[j] = ret[j] ^ (n-(i+j));
      }
      for(var j = 0; j < 16; j+= 2) {
        ret[j] = ret[j] ^ ~(n-(i+j));
      }
    }
  }
  for(var i = 0; i < 16; i++) {
    ret[i] = ret[i] & 0x000000ff;
  }
  return ret;
}

/// 変換処理.
var _convert = function(key, no, pause) {
  switch ((no & 0x00000001)) {
    case 0:
      return (((pause ^ key[no])) & 0x000000ff) ;
    case 1:
      return (~(pause ^ key[no]) & 0x000000ff) ;
  }
  return 0 ;
}

var _convertKey = function(pKey, key) {
  var low = code16(pKey,0);
  var hight = code16(key,0);
  var ret = new Uint8Array(32);
  for (var i = 0,j = 0,k = 15; i < 16; i++, j += 2, k--) {
    ret[j] = _convert(low, i, key[j]);
    ret[j + 1] = _convert(hight, i, low[k]);
  }
  return ret;
}

var _key256 = function(key32) {
  var ret = new Uint8Array( 256 ) ;
  var b = new Uint8Array( 4 ) ;
  var o ;
  var n = 0 ;
  var s,e ;
  for( var i = 0,j = 0 ; i < 31 ; i += 2,j += 16 ) {
    s = ( key32[i] & 0x000000ff ) ;
    e = ( key32[i+1] & 0x000000ff ) ;
    if( ( n & 0x00000001 ) != 0 ) {
      n += s ^ (~ e ) ;
    }
    else {
      n -= (~s) ^ e ;
    }
    b[0] = (n & 0x000000ff) ;
    b[1] = (((n & 0x0000ff00)>>8)&0x000000ff) ;
    b[2] = (((n & 0x00ff0000)>>16)&0x000000ff) ;
    b[3] = (((n & 0xff000000)>>24)&0x000000ff) ;
    o = code16(b,0) ;
    arraycopy( o,0,ret,j,16 ) ;
  }
  return ret ;
}

var _getStepNo = function(pubKey, binary) {
  var i, j;
  var bin;
  var ret = 0;
  var len = binary.length ;
  var addCd = (pubKey[(binary[len>>1] & 0x0000001f)] & 0x00000003) + 1;
  for (i = 0, j = 0; i < len; i += addCd, j += addCd) {
    bin = ((~binary[i]) & 0x000000ff);
    ret = ((bin & 0x00000001) + ((bin & 0x00000002) >> 1)
      + ((bin & 0x00000004) >> 2) + ((bin & 0x00000008) >> 3)
      + ((bin & 0x00000010) >> 4) + ((bin & 0x00000020) >> 5)
      + ((bin & 0x00000040) >> 6) + ((bin & 0x00000080) >> 7))
      + (j & 0x000000ff) + ret;
  }
  if ((ret & 0x00000001) == 0) {
    for (i = 0; i <32; i++) {
      bin = (((pubKey[i] & 0x00000001) == 0) ? ((~pubKey[i]) & 0x000000ff)
        : (pubKey[i] & 0x000000ff));
      ret += ((bin & 0x00000001) + ((bin & 0x00000002) >> 1)
        + ((bin & 0x00000004) >> 2) + ((bin & 0x00000008) >> 3)
        + ((bin & 0x00000010) >> 4) + ((bin & 0x00000020) >> 5)
        + ((bin & 0x00000040) >> 6) + ((bin & 0x00000080) >> 7));
    }
  } else {
    for (i = 0; i < 32; i++) {
      bin = (((pubKey[i] & 0x00000001) == 0) ? ((~pubKey[i]) & 0x000000ff)
        : (pubKey[i] & 0x000000ff));
      ret -= ((bin & 0x00000001) + ((bin & 0x00000002) >> 1)
        + ((bin & 0x00000004) >> 2) + ((bin & 0x00000008) >> 3)
        + ((bin & 0x00000010) >> 4) + ((bin & 0x00000020) >> 5)
        + ((bin & 0x00000040) >> 6) + ((bin & 0x00000080) >> 7));
    }
  }
  return ((~ret) & 0x000000ff);
}

var _flip = function(pause, step) {
  switch (step & 0x00000007) {
  case 1:
    return ((((pause & 0x00000003) << 6) & 0x000000c0) | (((pause & 0x000000fc) >> 2) & 0x0000003f)) & 0x000000ff ;
  case 2:
    return ((((pause & 0x0000003f) << 2) & 0x000000fc) | (((pause & 0x000000c0) >> 6) & 0x00000003)) & 0x000000ff ;
  case 3:
    return ((((pause & 0x00000001) << 7) & 0x00000080) | (((pause & 0x000000fe) >> 1) & 0x0000007f)) & 0x000000ff ;
  case 4:
    return ((((pause & 0x0000000f) << 4) & 0x000000f0) | (((pause & 0x000000f0) >> 4) & 0x0000000f)) & 0x000000ff ;
  case 5:
    return ((((pause & 0x0000007f) << 1) & 0x000000fe) | (((pause & 0x00000080) >> 7) & 0x00000001)) & 0x000000ff ;
  case 6:
    return ((((pause & 0x00000007) << 5) & 0x000000e0) | (((pause & 0x000000f8) >> 3) & 0x0000001f)) & 0x000000ff ;
  case 7:
    return ((((pause & 0x0000001f) << 3) & 0x000000f8) | (((pause & 0x000000e0) >> 5) & 0x00000007)) & 0x000000ff ;
  }
  return pause & 0x000000ff ;
}

var _nflip = function(pause, step) {
  switch (step & 0x00000007) {
  case 1:
    return ((((pause & 0x0000003f) << 2) & 0x000000fc) | (((pause & 0x000000c0) >> 6) & 0x00000003)) & 0x000000ff ;
  case 2:
    return ((((pause & 0x00000003) << 6) & 0x000000c0) | (((pause & 0x000000fc) >> 2) & 0x0000003f)) & 0x000000ff ;
  case 3:
    return ((((pause & 0x0000007f) << 1) & 0x000000fe) | (((pause & 0x00000080) >> 7) & 0x00000001)) & 0x000000ff ;
  case 4:
    return ((((pause & 0x0000000f) << 4) & 0x000000f0) | (((pause & 0x000000f0) >> 4) & 0x0000000f)) & 0x000000ff ;
  case 5:
    return ((((pause & 0x00000001) << 7) & 0x00000080) | (((pause & 0x000000fe) >> 1) & 0x0000007f)) & 0x000000ff ;
  case 6:
    return ((((pause & 0x0000001f) << 3) & 0x000000f8) | (((pause & 0x000000e0) >> 5) & 0x00000007)) & 0x000000ff ;
  case 7:
    return ((((pause & 0x00000007) << 5) & 0x000000e0) | (((pause & 0x000000f8) >> 3) & 0x0000001f)) & 0x000000ff ;
  }
  return pause & 0x000000ff ;
}

var _convert256To = function(key256, pKey, step) {
  var ns = step ;
  for (var i = 0, j = 0; i < 256; i++, j = ((j + 1) & 0x0000001f)) {
    ns = (ns ^ (~(key256[i]))) ;
    if( (ns & 0x00000001 ) == 0 ) {
      ns = ~ns ;
    }
    key256[i] = _convert(pKey, j, key256[i]);
    key256[i] = _flip(key256[i], ns);
  }
  return ns;
}

var _ed = function(mode, binary, key256, step) {
  var len = binary.length ;
  var ns = step ;
  if( mode ) {
    for (var i = 0, j = 0; i < len; i++, j = ((j + 1) & 0x000000ff)) {
      ns = (ns ^ (~( key256[j]))) ;
      if( (ns & 0x00000001 ) != 0 ) {
        ns = ~ns ;
      }
      binary[i] = _convert(key256, j, binary[i]);
      binary[i] = _flip(binary[ i ], ns) ;
    }
  }
  else {
    for (var i = 0, j = 0; i < len; i++, j = ((j + 1) & 0x000000ff)) {
      ns = (ns ^ (~( key256[j]))) ;
      if( (ns & 0x00000001 ) != 0 ) {
        ns = ~ns ;
      }
      binary[i] = _nflip(binary[ i ], ns) ;
      binary[i] = _convert(key256, j, binary[i]);
    }
  }
}

var strToArray = function(s) {
  var len = s.length ;
  var ret = new Uint8Array( len ) ;
  for( var i = 0 ; i < len ; i ++ ) {
    ret[ i ] = s.charCodeAt( i )|0 ;
  }
  return ret ;
}

var aryToString = function(s) {
  var len = s.length ;
  var ret = "";
  for( var i = 0 ; i < len ; i ++ ) {
    ret += String.fromCharCode( s[ i ] ) ;
  }
  return ret;
}

var arraycopy = function(s, sp, d, dp, len) {
  len = len|0;
  sp = sp|0;
  dp = dp|0;
  for( var i = 0 ; i < len ; i ++ ) {
    d[(dp+i)] = s[(sp+i)] ;
  }
}

_g.fcipher = fcipher;
})(global);
