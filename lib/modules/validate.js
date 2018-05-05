// validate パラメータチェック.
//

module.exports = (function (_g) {
"use strict";
var checker = require("./subs/checker");
var o = {}
var request = null;
var params = null;

o.create = function(req, pms) {
  request = req;
  params = pms;
}

o.clear = function() {
  request = null;
  params = null;
}

// validateを定義します.
// 以下のような感じで実装します.
// 第一: method制限(ない場合は指定しなくてよい).
// 第二 ～ パラメータ名, パラメータの型, 処理内容.
//
// パラメータ名の最初に[X-]が付く場合、ヘッダ情報の内容を見ます.
//
// validate.check("POST",
//     "name",          "string", "req",        // name文字パラメータで、必須情報.
//     "age",           "number", "default 18", // age数値パラメータ.
//     "lat",           "float",  "default 0.0",// 経度浮動小数点パラメータ.
//     "comment",       "string", "max 128",    // comment文字パラメータで、最大文字が128文字.
//     "X-Test-Code",   "string", "req"         // X-Test-Code Httpヘッダパラメータで、必須.
// );
//
o.check = function() {
  var args = arguments;
  var len = args.length;
  var method = args[0].toLowerCase();
  var pos = 1;
  if(method != "get" && method != "post" &&
    method != "delete" && method != "put" &&
    method != "patch") {
    pos = 0;
    method = null;
  }
  var type = null;
  var validate = [];
  for(var i = pos ; i < len; i += 3) {
    type = checker.types(args[i+1]);
    
    // 型データでない場合エラー.
    if(type < 0) {
      throw new Error("The validate setting is invalid(line:" +
        (i+1) + " name:" + args[i] + ")");
    // 型データの場合.
    } else {
      validate.push({
        name: args[i],
        type: type,
        call: checker.dataCalls(args[i+2])
      });
    }
  }
  // チェック処理.
  execute(validate, method, request, params);
}

// validate生成定義に対して、パラメータチェック.
var execute = function(validate, method, request, params) {
  // メソッド不一致.
  if(method != null) {
    var m = request.method.toLowerCase();
    if(m != method) {
      throw {status: 405, message:
        "Accessed by methods other than permitted ("+
        m+"): "+method};
    }
  }
  // パラメータ変換＋チェック.
  var one, n, value, hflg;
  var len = validate.length;
  for(var i = 0;i < len; i ++) {
    one = validate[i];
    // ヘッダチェック.
    if(one.name.indexOf("X-") == 0) {
      hflg = true;
      value = request.headers[one.name];
    } else {
      hflg = false;
      value = params[one.name];
    }
    var name = one.name;
    value = checker.convert(one.type, value);
    n = one.call(name, one.type, value);
    if (n["rename"] != undefined) {
      name = n["rename"];
    }
    if (n["default"] != undefined) {
      params[name] = n["default"];
    } else {
      params[name] = value;
    }
  }
}

return o;
})(global);
