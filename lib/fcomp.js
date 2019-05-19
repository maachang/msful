// 高速圧縮・解凍処理.
//
module.exports = (function (_g) {
"use strict";
var _u = undefined;
var o = {} ;

var strs = require("./strs");

// Limit.
var _LIMIT = 64 ;

// Hashマスク値.
var _HASH = 0x1e35a7bd ;

// 連続左ゼロビット長を取得.
var _nlzs = function( x ) {
  x |= ( x >>  1 );
  x |= ( x >>  2 );
  x |= ( x >>  4 );
  x |= ( x >>  8 );
  x |= ( x >> 16 );
  x = (x & 0x55555555) + (x >> 1 & 0x55555555);
  x = (x & 0x33333333) + (x >> 2 & 0x33333333);
  x = (x & 0x0f0f0f0f) + (x >> 4 & 0x0f0f0f0f);
  x = (x & 0x00ff00ff) + (x >> 8 & 0x00ff00ff);
  return (x & 0x0000ffff) + (x >>16 & 0x0000ffff);
}

// ビットサイズの取得.
var _bitMask = function( x ) {
  x = x|0 ;
  if( x <= 256 ) {
    return 256 ;
  }
  x |= ( x >>  1 );
  x |= ( x >>  2 );
  x |= ( x >>  4 );
  x |= ( x >>  8 );
  x |= ( x >> 16 );
  x = (x & 0x55555555) + (x >> 1 & 0x55555555);
  x = (x & 0x33333333) + (x >> 2 & 0x33333333);
  x = (x & 0x0f0f0f0f) + (x >> 4 & 0x0f0f0f0f);
  x = (x & 0x00ff00ff) + (x >> 8 & 0x00ff00ff);
  x = (x & 0x0000ffff) + (x >>16 & 0x0000ffff);
  return 1 << ( ( (x & 0x0000ffff) + (x >>16 & 0x0000ffff) ) - 1 ) ;
}

// 配列コピー.
var _arraycopy = function( s,sp,d,dp,aLen ) {
  aLen = aLen|0 ;
  sp = sp|0 ;
  dp = dp|0 ;
  for( var i = 0 ; i < aLen ; i ++ ) {
    d[dp+i] = s[sp+i] ;
  }
}

// 4バイト整数変換.
var _byte4ToInt = function( s,p ) {
  return ((s[p]&255)<<24)|
    ((s[p+1]&255)<<16)|
    ((s[p+2]&255)<<8)|
    (s[p+3]&255) ;
}

// 圧縮に対するバッファ数を取得.
// len 元のサイズを設定します.
// 戻り値 : 圧縮時の最大バッファ長が返却されます.
var _calcMaxCompressLength = function( len ) {
  len = len|0 ;
  return ( 32 + len + ( len / 6 ) )|0;
}

// 解凍対象のバッファ数を取得.
// binary 圧縮バイナリを設定します.
// off オフセットを設定します.
// 戻り値 : 解凍対象のバッファサイズが返却されます.
var _decompressLength = function( binary,off ) {
  off = off|0 ;
  var ret = 0 ;
  var i = 0 ;
  do {
    ret += (binary[off] & 0x7f) << (i++ * 7);
  } while ((binary[off++] & 0x80) == 0x80);
  return ret ;
}

// 圧縮処理(バイナリ).
// out 圧縮結果のバイナリ配列を設定します.
// src 対象のバイナリ配列を設定します.
// off 対象のオフセット値を設定します.
// len 対象の長さを設定します.
// 戻り値 : 圧縮されたバッファ長が返却されます.
var _comp = function( out,src,offset,length ) {
  offset = offset|0 ;
  length = length|0 ;
  
  var len,tLen,fp,n,i,cnt ;
  var len4 = length + 4 ;
  var lenM4 = length - 4 ;
  var offLenM4 = lenM4 + offset ;
  var offLen = offset + length ;
  var hOff = 0 ;
  var hLen = 0 ;
  
  // Hash衝突率を下げるためのヒントを設定.
  var hashShift = _nlzs( length ) ;
  if( hashShift > 16 ) {
    hashShift = 31-hashShift ;
  }
  
  // ヘッダに元の長さをセット.
  n = length;
  var outIndex = 0 ;
  while( n > 0 ) {
    out[outIndex++] = (n>=128) ? (0x80 | (n&0x7f)) : n & 255 ;
    n >>= 7;
  }
  
  // 圧縮用Hash条件を生成.
  var _msk = ( _bitMask( length / 6 ) ) - 1 ;
  var _cc = new Uint32Array( _msk+1 ) ;
  
  // 外部定義の最適化.
  var _hash = _HASH|0 ;
  var _limit = _LIMIT|0 ;
  var _b2i = _byte4ToInt ;
  var _ac = _arraycopy ;
  
  // 先頭４バイトの圧縮用Hash条件をセット.
  len = ( offLenM4 < offset + 4 ) ? offLenM4 : offset + 4 ;
  for(i = offset; i < len ;
    _cc[ ( ( _b2i(src,i) * _hash ) >> hashShift ) & _msk ] = i ++ ){};
  
  var lastHit = offset ;
  for( i = offset + 4; i < offLenM4 ; i ++ ) {
    
    // 圧縮条件が存在する場合.
    n = _b2i( src,i ) ;
    fp = _cc[ ( ( n * _hash ) >> hashShift ) & _msk ] ;
    if( n == _b2i( src,fp ) && fp + 4 < i && i + 4 < offLen ) {
      
      // limitまでの同一条件をチェック.
      hLen = 4 ;
      tLen = ( i + hLen + _limit < offLen ) ?
        ( ( fp + hLen + _limit < i ) ? _limit : i - ( fp + hLen ) ) :
        offLen - ( i + hLen ) ;
      for( ; hLen < tLen && (src[ fp + hLen ]&255) == (src[ i + hLen ]&255) ;
        hLen ++ ){};
      
      // 圧縮位置をセット.
      hOff = i - fp ;
      
      // 圧縮用Hash条件をセット.
      _cc[ ( ( n * _hash ) >> hashShift ) & _msk ] = i ;
      
    }
    // 圧縮条件が存在しない場合.
    else {
      
      // 圧縮用Hash条件をセット.
      _cc[ ( ( n * _hash ) >> hashShift ) & _msk ] = i ;
      
      // 圧縮処理なし.
      continue ;
    }
    
    // 非圧縮情報をセット.
    if( lastHit < i ) {
      
      // (3bit)ヘッド[0]をセット.
      if ( ( len = ( i - lastHit ) - 1 ) < 60) {
        
        // 非圧縮条件が60バイト未満の場合.
        out[outIndex++] = (len<<2);
      }
      else if (len < 0x100) {
        
        // 非圧縮条件が256バイト未満の場合.
        out[outIndex] = 240 ;
        out[outIndex+1] = len;
        outIndex += 2 ;
      }
      else if (len < 0x10000) {
        
        // 非圧縮条件が65536バイト未満の場合.
        out[outIndex] = 244 ;
        out[outIndex+1] = len;
        out[outIndex+2] = (len>>8);
        outIndex += 3 ;
      }
      else if (len < 0x1000000) {
        
        // 非圧縮条件が16777216バイト未満の場合.
        out[outIndex] = 248 ;
        out[outIndex+1] = len;
        out[outIndex+2] = (len>>8);
        out[outIndex+3] = (len>>16);
        outIndex += 4 ;
      }
      else {
        
        // 非圧縮条件が16777215バイト以上の場合.
        out[outIndex] = 252 ;
        out[outIndex+1] = len;
        out[outIndex+2] = (len>>8);
        out[outIndex+3] = (len>>16);
        out[outIndex+4] = (len>>24);
        outIndex += 5 ;
      }
      
      _ac(src, lastHit, out, outIndex, len + 1) ;
      outIndex += len + 1 ;
      lastHit = i ;
    }
    
    // 圧縮位置をセット.
    if(hLen <= 11 && hOff < 2048) {
      
      // (3bit)ヘッド[1]をセット.
      out[outIndex] = ( 1 | ((hLen-4)<<2) | ((hOff>>3)&0xe0) ) ;
      out[outIndex+1] = (hOff&255);
      outIndex += 2 ;
    }
    else if (hOff < 65536) {
      
      // (3bit)ヘッド[2]をセット.
      out[outIndex] = ( 2 | ((hLen-1)<<2) ) ;
      out[outIndex+1] = (hOff);
      out[outIndex+2] = (hOff>>8);
      outIndex += 3 ;
    }
    else {
      
      // (3bit)ヘッド[3]をセット.
      out[outIndex] = ( 3 | ((hLen-1)<<2) ) ;
      out[outIndex+1] = (hOff);
      out[outIndex+2] = (hOff>>8);
      out[outIndex+3] = (hOff>>16);
      out[outIndex+4] = (hOff>>24);
      outIndex += 5 ;
    }
    
    // 圧縮用Hash条件をセット.
    tLen = ( lastHit > offLenM4 ) ? offLenM4 : lastHit ;
    for( ; i < tLen;
      _cc[ ( ( _b2i(src,i) * _hash ) >> hashShift ) & _msk ] = i ++ ){};
    lastHit = i + hLen ;
    
    tLen = ( lastHit-1 > offLenM4 ) ? offLenM4 : lastHit-1 ;
    for( ; i < tLen;
      _cc[ ( ( _b2i(src,i) * _hash ) >> hashShift ) & _msk ] = i ++ ){};
    i = lastHit - 1 ;
  }
  
  // 終了時に非圧縮情報が存在する場合.
  if (lastHit < offLen) {
    
    // (3bit)ヘッド[0]をセット.
    if (( len = ( offLen - lastHit ) - 1 ) < 60) {
      out[outIndex++] = (len<<2);
    }
    // (3bit)ヘッド[1]をセット.
    else if (len < 0x100) {
      out[outIndex] = 240 ;
      out[outIndex+1] = len;
      outIndex += 2 ;
    }
    // (3bit)ヘッド[2]をセット.
    else if (len < 0x10000) {
      out[outIndex] = 244 ;
      out[outIndex+1] = len;
      out[outIndex+2] = (len>>8);
      outIndex += 3 ;
    }
    // (3bit)ヘッド[3]をセット.
    else if (len < 0x1000000) {
      out[outIndex] = 248 ;
      out[outIndex+1] = len;
      out[outIndex+2] = (len>>8);
      out[outIndex+3] = (len>>16);
      outIndex += 4 ;
    }
    // (3bit)ヘッド[4]をセット.
    else {
      out[outIndex] = 252 ;
      out[outIndex+1] = len;
      out[outIndex+2] = (len>>8);
      out[outIndex+3] = (len>>16);
      out[outIndex+4] = (len>>24);
      outIndex += 5 ;
    }
    _ac(src, lastHit, out, outIndex, len + 1);
    outIndex += len + 1 ;
  }
  return outIndex ;
}

// 解凍処理(バイナリ).
// out 解凍先のバイナリを設定します.
// src 圧縮バイナリを設定します.
// offset 圧縮バイナリのオフセット値を設定します.
// length 圧縮バイナリの長さを設定します.
// 戻り値 : 解凍バイナリ長が返却されます.
var _dec = function( out,src,offset,length ) {
  offset = offset|0 ;
  length = length|0 ;
  
  var p,c,bc,n,o ;
  var targetIndex = 0;
  var offLen = offset + length ;
  var sourceIndex = offset ;
  var targetLength = 0 ;
  var _ac = _arraycopy ;
  
  // 全体の長さを取得.
  p = 0 ;
  do {
    targetLength += (src[sourceIndex] & 0x7f) << (p++ * 7);
  } while ((src[sourceIndex++] & 0x80) == 0x80);
  
  while(sourceIndex < offLen && targetIndex < targetLength) {
    
    // 対象ブロック毎の処理.
    if( ( bc = src[sourceIndex] & 3 ) == 0 ) {
      
      // 非圧縮情報の取得.
      if( ( o = ( n = (src[sourceIndex++] >> 2) &
        0x3f ) - 60 ) > -1 ) {
        for( ++o,c = 1,n = (src[ sourceIndex ] & 255) ;
          c < o ;
          n |= ( src[ sourceIndex+c ] & 255 ) <<
            ( c ++ << 3 ) ){};
        sourceIndex += o ;
      }
      _ac(src, sourceIndex, out, targetIndex, ++n );
      sourceIndex += n ;
      targetIndex += n ;
    }
    else {
      
      // 圧縮情報の取得.
      switch( bc ) {
        case 1 :
          n = ( (src[sourceIndex] >> 2) & 0x7) + 4 ;
          o = ( (src[sourceIndex] & 0xe0) << 3 ) |
              ( src[sourceIndex+1] & 255 ) ;
          sourceIndex += 2 ;
          break ;
        case 2 :
          n = ( (src[sourceIndex] >> 2) & 0x3f) + 1 ;
          o = ( src[sourceIndex+1] & 255 ) |
              ( (src[sourceIndex+2] & 255) << 8 ) ;
          sourceIndex += 3 ;
          break ;
        case 3 :
          n = ((src[sourceIndex] >> 2) & 0x3f) + 1;
          o = ( src[sourceIndex+1] & 255 ) |
              ( (src[sourceIndex+2] & 255) << 8 ) |
              ( (src[sourceIndex+3] & 255) << 16 ) |
              ( (src[sourceIndex+4] & 255) << 24 ) ;
          sourceIndex += 5 ;
      }
      
      // 圧縮情報のセット.
      for( p = targetIndex - o,c = p + n ;
        p < c ;
        out[ targetIndex ++ ] = out[ p ++ ]&255 ){};
    }
  }
  
  // 処理範囲を超えている場合はエラー.
  if(targetIndex > targetLength) {
    throw new Error("Superfluous input data encountered on offset (index:" +
      targetIndex + " max:" + targetLength + ")") ;
  }
  return targetLength ;
}

// 圧縮処理.
// src 圧縮対象の情報を設定します.
// off 対象のオフセット値を設定します.
// len 対象の長さを設定します.
// 戻り値 : 圧縮された情報が返却されます.
o.freeze = function( src,off,len ) {
  off = off|0 ;
  len = len|0 ;
  
  if( len == 0 ) {
    len = src.length ;
  }
  if( typeof( src ) == "string" ) {
    src = strs.utf8ToBinary( src,off,len ) ;
    off = 0 ;
    len = src.length ;
  }
  var out = new Uint8Array( _calcMaxCompressLength( len ) )
  var res = _comp( out,src,off,len ) ;
  var ret = new Uint8Array( res );
  _arraycopy( out,0,ret,0,res ) ;
  return ret ;
}

// 解凍処理.
// src 解凍対象の情報を設定します.
// off 対象のオフセット値を設定します.
// len 対象の長さを設定します.
// 戻り値 : 解凍された情報が返却されます.
o.unfreeze = function( src,off,len ) {
  off = off|0 ;
  len = len|0 ;
  if( len == 0 ) {
    len = src.length ;
  }
  if( typeof( src ) == "string" ) {
    var t = [];
    for(var i = off; i < len; i ++) {
        t[t.length] = src.charCodeAt(i)|0;
    }
    src = t;
    off = 0 ;
    len = src.length ;
  }
  var ret = new Uint8Array( _decompressLength( src,off ) ) ;
  _dec( ret,src,off,len ) ;
  return ret ;
}

// 圧縮処理して文字列変換.
// src 圧縮対象の情報を設定します.
// off 対象のオフセット値を設定します.
// len 対象の長さを設定します.
// 戻り値 : 圧縮された情報が返却されます.
o.freeze_s = function( src,off,len ) {
  var res = o.freeze(src,off,len);
  var len = res.length;
  var ret = "";
  for(var i = 0; i < len; i ++) {
    ret +=  String.fromCharCode(res[i]);
  }
  return ret;
}

// 解凍処理を行い、文字列変換.
// src 解凍対象の情報を設定します.
// off 対象のオフセット値を設定します.
// len 対象の長さを設定します.
// 戻り値 : 解凍された情報が返却されます.
o.unfreeze_s = function( src,off,len ) {
  var ret = o.unfreeze(src,off,len);
  return strs.binaryToUTF8( ret,0,ret.length ) ;
}

return o ;
})(global);
