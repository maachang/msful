// 起動引数関連の処理.
//

module.exports = (function(_g) {
  "use strict";

  var nums = require("../nums");

  // helpコマンド用.
  var cmds = "";

  // 起動パラメータをセット.
  var _setArgv = function(n) {
    var pms = [];
    var len = n.length;
    for(var i = 0; i < len; i++) {
      pms[i] = n[i];
    }
    args_params = pms;
    return args_params;
  }

  // 起動パラメータ情報.
  var args_params = _setArgv(process.argv);

  // コマンド引数取得.
  var _args = function() {
    var targets = arguments;
    var nlen = targets.length;
    var params = args_params;
    var len = params.length;
    for(var i = 2; i < len; i ++) {
      for(var j = 1; j < nlen; j ++) {
        if(targets[j] == params[i]) {
          if(i + 1 >= len) {
            return null;
          }
          return params[i+1];
        }
      }
    }
    return null;
  }

  // 数字変換.
  var _toNum = function(n) {
    if(n) {
      try {
        n = parseInt(n);
      } catch(e) {
        n = null;
      }
    } else {
      n = null;
    }
    return n;
  }

  // 小数点変換.
  var _toFloat = function(n) {
    if(n) {
      try {
        n = parseFloat(n);
      } catch(e) {
        n = null;
      }
    } else {
      n = null;
    }
    return n;
  }

  // boolean変換.
  var _toBool = function(n) {
    if(n) {
      try {
        if(n == "true" || n == "t" || n == "on") n = true;
        else if(n == "false" || n == "f" || n == "off") n = false;
      } catch(e) {
        n = null;
      }
    } else {
      n = null;
    }
    return n;
  }

  // Date変換.
  var _toDate = function(n) {
    if(n) {
      try {
        if(nums.isNumeric(n)) {
          n = new Date(parseInt(n));
        } else {
          n = new Date(n);
        }
      } catch(e) {
        n = null;
      }
    } else {
      n = null;
    }
    return n;
  }

  // type変換.
  //  [string, str] 文字列で返却します.
  //  [number, num, int, long] 整数で返却します.
  //  [float, double] 浮動小数点で返却します.
  //  [boolean, bool] boolean型で返却します.
  //  [date, datetime, timestamp] Dateオブジェクトで返却します.
  //  何も設定しない、該当しない場合は[string]で返却されます.
  var _convertType = function(type, value) {
    if(!type) {
      type = "string"
    } else {
      type = (""+type).toLowerCase();
    }
    if(type == "number" || type == "num" || type == "int" || type == "long") {
      return _toNum(value);
    } else if(type == "float" || type == "double") {
      return _toFloat(value);
    } else if(type == "boolean" || type == "bool") {
      return _toBool(value);
    } else if(type == "date" || type == "datetime" || type == "timestamp") {
      return _toDate(value);
    }
    return value;
  }

  var o = {}

  // データクリア.
  o.clear = function() {
    cmds = "";
    args_params = _setArgv(process.argv);
  }

  // 情報破棄.
  o.destroy = function() {
    cmds = null;
    args_params = null;
  }

  // args_paramsを設定.
  o.setArgv = function(n) {
    return _setArgv(n);
  }

  // args_paramsを取得.
  o.getArgv = function() {
    return args_params;
  }

  // データ取得.
  o.get = function(comment) {
    var pms = arguments;
    var len = pms.length;
    for(var i = 1; i < len; i ++) {
      if(i == 1) {
        cmds += "   " + pms[i];
      } else {
        cmds += " [" + pms[i] + "]"
      }
    }
    cmds += " " + comment + "\n";
    return _args.apply(null, pms)
  }

  // 指定パラメータ引数を削除.
  o.remove = function() {
    var targets = arguments;
    var nlen = targets.length;
    var params = args_params;
    var len = params.length;
    for(var i = 2; i < len; i ++) {
      for(var j = 0; j < nlen; j ++) {
        if(targets[j] == params[i]) {
          if(i + 1 >= len) {
            return;
          }
          params.splice(i, 2);
          return;
        }
      }
    }
  }

  // ヘルプデータを取得.
  o.getHelp = function() {
    return cmds;
  }

  // 起動時のパラメータ情報を取得.
  // type: 取得タイプを設定します.
  //       [string, str] 文字列で返却します.
  //       [number, num, int, long] 整数で返却します.
  //       [float, double] 浮動小数点で返却します.
  //       [boolean, bool] boolean型で返却します.
  //       [date, datetime, timestamp] Dateオブジェクトで返却します.
  //       何も設定しない、該当しない場合は[string]で返却されます.
  // message : ヘルプで表示するメッセージを設定します.
  // options : 起動パラメータ変数名をarrayで設定します.
  //           ["-p", "--port"]
  //           のような感じだと[-p]と[--port]が対象となります.
  //
  // 普通に[get]を使うよりは、こちらの方が「認識した情報」をパラメータから削除してくれる.
  // それに変換処理も行ってくれるので、こちらを利用する方が楽です.
  o.registrationParams = function(type, message, options) {
    var params = [message];
    var len = options.length;
    for(var i = 0;i < len;i ++) {
      params.push(options[i]);
    }
    var ret = null
    try {
      ret = this.get.apply(null, params);
      if (ret) {
        this.remove.apply(null, options);
      } else {
        ret = null;
      }
    } catch (e) {
      ret = null
    }
    return _convertType(type, ret);
  }

  return o;
})(global);