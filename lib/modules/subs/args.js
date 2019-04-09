// 起動引数関連の処理.
//

module.exports = (function(_g) {
  "use strict";

  // コマンド引数取得.
  var args = function() {
    var names = arguments;
    var nlen = names.length;
    var args = process.argv;
    var len = args.length;
    for(var i = 2; i < len; i ++) {
      for(var j = 1; j < nlen; j ++) {
        if(names[j] == args[i]) {
          if(i + 1 >= len) {
            return null;
          }
          return args[i+1];
        }
      }
    }
    return null;
  }

  var cmds = "";
  var o = {}

  // ヘルプデータクリア.
  o.clear = function() {
    cmds = "";
  }

  // データ取得.
  o.get = function(comment) {
    var args = arguments;
    var len = args.length;
    for(var i = 1; i < len; i ++) {
      if(i == 1) {
        cmds += "   " + args[i];
      } else {
        cmds += " [" + args[i] + "]"
      }
    }
    cmds += " " + comment + "\n";
    return args.apply(null, args)
  }

  // ヘルプデータを取得.
  o.getHelp = function() {
    return cmds;
  }

  return o;
})(global);