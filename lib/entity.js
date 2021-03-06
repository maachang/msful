// entity JSON整形.
//

module.exports = (function (_g) {
"use strict";

var checker = require("./subs/checker");
var utils = require("./u")

var o = {}
var entities = null;

o.create = function() {
  entities = {};
}

o.clear = function() {
  entities = null;
}

// entityを定義します.
// 以下のような感じで実装します.
// 第一: entity名.
// 第二: method制限(ない場合は指定しなくてよい).
// 第三 ～ パラメータ名, パラメータの型, 処理内容.
//
// entity.expose("User"
//  ,"name"         ,"string"       ,"req"
//  ,"age"          ,"number"       ,"default 18"
//  ,"comments"     ,"{"            ,""
//    ,"offset"       ,"number"     ,""
//    ,"limit"        ,"number"     ,""
//    ,"list"         ,"$Comment"   ,""
//  ,"comments"     ,"}"            ,""
// );
//
// entity.expose("Comment"
//  ,"id"           ,"number"       ,"req"
//  ,"name"         ,"string"       ,"default 'unknown'"
//  ,"value"        ,"string"       ,"req"
//  ,"time"         ,"timestamp"    ,"req"
// );
//
o.expose = function() {
  var args = arguments;
  var len = args.length;
  var name = args[0];
  var type = null;
  var entity = [];
  for(var i = 1 ; i < len; i += 3) {
    type = checker.types(args[i+1]);
    
    // 型データでない場合.
    if(type < 0) {
      if(type == -1) {
        entity.push({
          name: args[i],
          entity: args[i+1].substring(1).trim(),
          type: type,
          call: null
        });
      } else {
        entity.push({
          name: args[i],
          type: type,
          call: null
        });
      }
    // 型データの場合.
    } else {
      entity.push({
        name: args[i],
        type: type,
        call: checker.dataCalls(args[i+2])
      });
    }
  }
  // 管理データにセット.
  entities[name] = entity;
}

// entity生成.
// name : expose名を設定します.
// value : 変換対象のオブジェクトを設定します.
// 戻り値 : 整形されたentityが返却されます.
o.make = function(name, value) {
  var ret = {};
  _make(ret, name, value);
  return ret;
}

// 生成.
var _make = function(out, name, value) {
  var src = entities[name];
  if(src == undefined) {
    throw new Error("Entity of specified name \"" + name + "\" does not exist.");
  } else if(typeof(value) != "object") {
    throw new Error("Specified name \""+ name +"\"data type is invalid.");
  }
  var e, sub, key, v, n, len, lenJ;
  var stack = utils.stack;
  len = src.length;
  for(var i = 0; i < len; i ++) {
    e = src[i];
    key = e.name;
    // 特殊条件
    if(e.type < 0) {
      switch(e.type) {
        case -1: // 別のentity名が設定されている場合.
          if(typeof(value[key]) == "object") {
            v = value[key];
            
            // 対象が配列の場合は、配列でセット.
            if(Array.isArray(v)) {
              n = 0;
              sub = [];
              out[key] = sub;
              lenJ = v.length;
              for(var j = 0;j < lenJ; j ++) {
                if(typeof(v[j]) == "object") {
                  sub[n] = {};
                  _make(sub[n], e.entity, v[j]);
                  n ++;
                }
              }
              sub = null;
            // 連想配列でセット.
            } else {
              sub = {};
              out[key] = sub;
              _make(sub, e.entity ,v);
              sub = null;
            }
          } else {
            out[key] = {};
          }
          break;
        case -10: // 括弧開始.
        case -20:
          sub = {};
          out[key] = sub;
          stack.push(out);
          out = sub;
          sub = null;
          break;
        case -11: // 括弧終了.
        case -21:
          if((out = stack.pop()) == null) {
            throw new Error("Parentheses closed position is invalid:" + name);
          }
          break;
      }
    // 通常条件.
    } else {
      v = value[key];
      v = checker.convert(e.type, v, true);
      n = e.call(key, e.type, v);
      if (n["rename"] != undefined) {
        key = n["rename"];
      }
      if (n["default"] != undefined) {
        out[key] = n["default"];
      } else {
        out[key] = v;
      }
    }
  }
}

return o;
})(global);
