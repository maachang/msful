// 起動引数関連の処理.
//

module.exports = (function(_g) {
  "use strict";

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

  return o;
})(global);