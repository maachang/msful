// yaml読み込み.
//
module.exports = (function(_g) {
"use strict";

var COMMENT = 99; // コメントアウト.
var FOE = -1; // ファイル内区切り.
var HASH = 0; // ハッシュ.
var LIST = 1; // リスト.

// セカンド命令.
var SECOND = 100;

// インデント情報.
var INDENT = 10000;

// 最初に出現する条件.
var FIRSTS = {
  '-': LIST    // リスト.
  ,'---': FOE  // ファイル内区切り.
}

// 次に出現する条件.
var SECONDS = {
  '|': SECOND + 0      // 各行の改行を保存する
  ,'|+': SECOND + 1    // 各行の改行と、最終行に続く改行を保存する
  ,'|-': SECOND + 2    // 各行の改行は保存するが、最終行の改行は取り除く
  ,'>': SECOND + 3     // 改行を半角スペースに置き換える、ただし最終行の改行は保存される
  ,'>+': SECOND + 4    // 改行を半角スペースに置き換え、最終行に続く改行を保存する
  ,'>-': SECOND + 5    // 改行を半角スペースに置き換え、最終行の改行を取り除く
  ,'---': FOE          // ファイル内区切り.
}

// なし.
var NONE = {
}

// 検出分に対する処理条件.
var FIRSTS_OR_SECONDS = {
  "0": FIRSTS,
  "1": SECONDS,
  "2": NONE,
}

// ファイルを読み込む.
var readFile = function(name) {
  return fs.readFileSync(name) + "";
}

// 文字の改行を￥nのみに整形.
var checkEnterByConvert = function(src) {
  if (src.indexOf("\r") != -1) {
    return src.replace("\r", "");
  }
  return src;
}

// 指定された行と列を取得.
var colsRows = function(src, p) {
  var cols = 0;
  var rows = 0;
  for (var i =0 ; i < p; i ++) {
    if (src[i] === '\n') {
      rows = 0;
      cols ++;
    } else {
      rows ++;
    }
  }
  return {rows:rows, cols:cols}
}

// 先頭スペース数を数える.
var getHeadSpace = function(result, point, src ,enter) {
  var ret = 0;
  var rcmt = -1;
  for(var i = point; i < enter; i ++) {
    if(src[i] === ' ') {
      ret ++;
    // リスト形式の先頭スペース計算方法.
    } else if(src[i] === '-' && src[i+1] === ' ' && src[i+2] != ' ') {
      rcmt = ret + 2;
      break;
    } else {
      break;
    }
  }
  result.push(INDENT + (rcmt != -1 ? rcmt : ret))
  return ret;
}

// 前回が文字条件の場合は、今回の文字条件と連結させる.
var appendString = function(result, s, e) {
  if(result.length > 0) {
    var n = result[result.length - 1];
    if (n instanceof Array) {
      n[1] = e
    } else {
      result.push([s,e])
    }
  } else {
    result.push([s,e])
  }
}

// 1行のデータ解析.
var analysis_line = function(result, point, src ,enter) {
  var c = null;
  var b = -1;
  var value = null;
  var s = point;
  var cote = -1;
  var par1 = 0;
  var par2 = 0;
  var firstCount = 0;
  for(var i = point; i < enter; i ++) {
    c = src[i];
    // コーテーション内である場合.
    if(cote != -1) {
      // コーテーションの閉じを検出.
      if(cote === c && b != '\\') {
        // カッコチェック中でない.
        if (par1 === 0 && par2 === 0) {
          result.push([s+1, i]);
          s = -1;
        }
        cote = -1
      }
    }
    // コーテーション開始.
    else if(cote === -1 && (c === '\'' || c === '\"')) {
      // カッコチェック中でない.
      if (par1 === 0 && par2 === 0) {
        if(s != -1) {
          appendString(result, s, i);
        }
        s = i;
      }
      cote = c;
    }
    // コメント行の場合は終了.
    else if(c === '#') {
      return COMMENT;
    }
    // カッコ内の処理中.
    else if (par1 != 0 || par2 != 0) {
      if(c === '}') {
        par1 --;        
      } else if (c === '{') {
        par1 ++;
      } else if(c === ']') {
        par2 --;
      } else if (c === '[') {
        par2 ++;
      }
      // error.
      if (par1 < 0 || par2 < 0 ) {
        throw new Error("The number of parentheses is inconsistent:" + colsRows(src, i));
      } else if (par1 === 0 && par2 === 0) {
        // カッコ終了.
        result.push([s, i + 1]);
        s = -1;
      }
    }
    // カッコ開始.
    else if (c === '{' || c === '[' || c === '}' || c === ']') {
      if(c === '}') {
        par1 --;        
      } else if (c === '{') {
        par1 ++;
      } else if(c === ']') {
        par2 --;
      } else if (c === '[') {
        par2 ++;
      }
      // error.
      if (par1 < 0 || par2 < 0 ) {
        throw new Error("The number of parentheses is inconsistent:" + colsRows(src, i));
      } else if(s != -1) {
        // 以前の条件が存在する場合.
        appendString(result, s, i);
      }
      s = i;
    }
    // コロンの検出.
    else if(c === ':') {
      if(s != -1) {
        appendString(result, s, i);
      }
      result.push(HASH);
      firstCount = 1;
      s = -1;
    }
    // 空行か行最後の文字を検索.
    else if(c === ' ' || i + 1 >= enter) {
      // 最後の文字位置だが、sが無効ニモカかわからず、その最後の文字情報が空白以外の場合は sを有効にする.
      if(s === -1 && i + 1 >= enter && c != ' ') {
        s = i;
      }
      // 以前に文字条件が存在しない場合は処理対象としない.
      if (s != -1) {
        // yaml用ワードかチェック.
        if((value = FIRSTS_OR_SECONDS[""+(firstCount>2 ? 2:firstCount)][src.substring(s,i+((i + 1 >= enter) ? 1:0))])) {
          // 特殊ワードのコードをセット.
          result.push(value);
          // データ解析終端の場合.
          if(value === FOE) {
            return FOE;
          }
        }
        else {
          appendString(result, s, i+((i + 1 >= enter) ? 1:0));
        }
        s = -1;
        firstCount ++;
      }
    } else if(s === -1) {
      s = i;
    }
    b = c;
  }
}

// 指定前のインデント位置を取得.
var getIndentPos = function(result, no) {
  var pos = result.length - 1
  while(no >= 0) {
    if (result[pos--] >= INDENT) {
      no --;
    }
    if(pos < 0) {
      return -1
    }
  }
  return pos + 1;
}

// セカンド命令が存在するかチェック.
var getSecondCmdPos = function(result, no) {
  no = no|0
  var code;
  var pos = result.length - 1
  while(no >= 0) {
    code = result[pos--];
    if (code >= SECOND && code < (SECOND << 1)) {
      no --;
    }
    if(pos < 0) {
      return -1
    }
  }
  return pos + 1;
}

// セカンドコマンド命令での解析処理.
var analysis_secondCmd = function(result, point, src ,enter) {
  result.push([point, enter])
}

// yamlフォーマットを解析.
var analysis = function(result, value) {
  value = checkEnterByConvert(value)
  var pos = null;
  var p = 0;
  var b = 0;
  var secondPos = -1;
  var lastPos = -1;
  while((p = value.indexOf("\n", b)) != -1) {
    pos = getHeadSpace(result, b, value, p);
    // セカンドコマンド解除.
    if (pos != secondPos) {
      secondPos = -1;
    }
    // セカンドコマンドが検出されていない場合.
    if(secondPos === -1) {
      analysis_line(result, b + pos, value, p);
      lastPos = getIndentPos(result, 0);
      // セカンドコマンドが今回存在するかチェックする.
      if(getSecondCmdPos(result, 0) > lastPos) {
        secondPos = pos;
      }
    // セカンドコマンドが検出されている場合.
    } else {
      analysis_secondCmd(result, b + pos, value, p);
    }
    b = p + 1;
  }
  // 最後の行.
  if(b < value.length) {
    pos = getHeadSpace(result, b, value, value.length);
    // セカンドコマンド解除.
    if (pos != secondPos) {
      secondPos = -1;
    }
    if(secondPos === -1) {
      analysis_line(result, b + pos, value, value.length);
    } else {
      analysis_secondCmd(result, b + pos, value, value.length)
    }
  }
  // 一番最後にファイル区切りをセット.
  if (result[result.length-1] != FOE) {
    result.push(FOE);
  }
}

// スタック.
var _stack = function() {
  var o = {} ;
  o._value = null ;
  o._last = null ;
  o.push = function(v) {
    if(o._value === null) {
      o._value = [v,null] ;
      o._last = o._value ;
    }
    else {
      var n = [v,null] ;
      o._last[1] = n;
      o._last = n ;
    }
  }
  o.pop = function() {
    if( o._value === null ) {
      return null ;
    }
    var v = o._value[0] ;
    o._value = o._value[1] ;
    if( o._value === null ) {
      o._last = null ;
    }
    return v ;
  }
  o.peek = function() {
    if( o._value != null ) {
      return o._value[0];
    }
    return null;
  }
  return o ;
}

// 文字列のyamlフォーマットを読み込む.
var load = function(value) {
  value = checkEnterByConvert(value);
  var result = [];
  analysis(result, value);
  var len = result.length;

  var n = null;
  var lines = null;
  var stk = _stack();

  var dataFlg = false;
  var ret = ""

  for(var i = 0; i < len; i ++) {

    n = result[i];

    // インデント.
    // ファイル終端.
    if(n >= INDENT || n === FOE) {

      // 1行処理終了.
      if(lines != null) {
        if(lines.list) {
          if(lines.hash) {
            
          }
        }


        
      }
      // 新しい１行処理.
      if(lines === null) {
        lines = {
          indent: n,
          string: [],
          list: false,
          hash: false,
          second: null,
          update: false
        };
      }
    }
    // セカンド命令.
    else if(n >= SECOND) {
      lines.second = n
      lines.update = true;
    }
    // リスト.
    else if(n === LIST) {
      lines.list = true;
      lines.update = true;
    }
    // ハッシュ.
    else if(n === HASH) {
      lines.hash = true;
      lines.update = true;
    }
    // 文字情報.
    else if(n instanceof Array) {
      lines.string.push(value.substring(n[0],n[1]))
      lines.update = true;
    }
  }
  return ret;
}


var test = function(name) {
  var ret = load(readFile(name))
  console.log(ret)
}

test("/Users/maachang/project/node/test.yml")
})(global);

