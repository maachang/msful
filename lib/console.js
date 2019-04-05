// console msful.
//

module.exports.createConsole = function (fileName, env) {
  'use strict';
  var _u = undefined;
  var out = function(n) {process.stdout.write(n);}
  var SIMBOL = "";
  var constants = require("./constants");
  var initMod = require("./modules/init");
  var cacheRequire = {cache:{}, time:Date.now()};
  var backupRequire = {cache:{}, time:Date.now()};
  
  // モジュール群.
  var _MODULES = {};
  
  // コンフィグ群.
  var _CONFIG = {};

  // 起動モード.
  var _MSFUL_ENV = "";
  
  // モジュール群とコンフィグ群を取得.
  var init = function(env) {
    // 実行環境条件のセット.
    initMod.setEnvironment(env);

    // デフォルトのモジュールを読み込む.
    initMod.loadModules(_MODULES, true);

    // コンフィグ情報を読み込む.
    initMod.readConfig(_CONFIG, constants.CONF_DIR);
    _CONFIG = Object.freeze(_CONFIG);

    // 環境情報を読み込む.
    _MSFUL_ENV = Object.freeze(initMod.getEnvironment());
  }

  // 起動モード用パラメータを取得.
  var _getConfigEnv = function() {
    var ret = _CONFIG[_MSFUL_ENV];
    if(!ret) {
      ret = _CONFIG;
    }
    return ret;
  }
  
  // モジュールをセット.
  var setModules = function(out) {
    initMod.setDefaults(out);
    for(var k in _MODULES) {
      out[k] = _MODULES[k];
    }
    out["config"] = _CONFIG;
    out["msfulEnv"] = _MSFUL_ENV;
    out["envConf"] = _getConfigEnv();
  }
  
  // ロゴ表示.
  var viewLogo = function() {
    constants.viewTitle(out);
    out(SIMBOL+"\n");
  }
  
  // 指定ファイルを実行.
  var executeFile = function(fileName) {
    
    // ファイル読み込み.
    var fs = require('fs');
    var src = fs.readFileSync(fileName, 'utf-8');
    fs = null;
    
    // vm.
    var vm = require('vm');
    
    // 実行スクリプトを合成.
    var srcScript = "(function(_g){\n" +
      "'use strict';\n" +
      src + "\n" +
      "})(global);";
    src = null;
    
    // コンテキスト内容セット.
    var memory = {}
    var context = vm.createContext(memory);
    setModules(memory);
    
    // 拡張require.
    memory.require =  Object.freeze(
      require("./require")(cacheRequire, backupRequire, _MODULES, _CONFIG));
    
    // 初期化が必要な処理を実行.
    initMod.createModules(null, null, null, true);
    
    try {
      
      // 実行処理.
      var script = new vm.Script(srcScript);
      srcScript = null;
      return script.runInContext(context);
    } finally {
      initMod.clearModules();
    }
  }
  
  // stdinで実行.
  var executeStdin = function() {
    
    viewLogo();
    
    // 初期表示.
    out(SIMBOL+"> ");
    
    // vm.
    var vm = require('vm');
    
    // コンテキストを作成.
    var memory = {};
    var context = vm.createContext(memory);
    
    // 対話モード.
    var reader = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    // ラインスクリプト実行.
    reader.on('line', function (line) {
      var res = null
      if(line == null || line == _u || line.length == 0) {
        res = "";
      } else if(line == "!!clear") {
        memory = {};
        initMod.createModules(null, null, null, true);
        out("clear memory!!\n");
      } else if(line == "env") {
        out(initMod.getEnvironment() + "\n");
      } else if(line == "exit" || line == "end") {
        out("exit\n");
        reader.close();
        return 0;
      } else {
        try {
          // モジュール再設定.
          setModules(memory);
          
          // 拡張require.
          memory.require = Object.freeze(
            require("./require")(cacheRequire, backupRequire, _MODULES, _CONFIG));
          
          // 初期化が必要な処理を実行.
          initMod.createModules(null, null, null, true);
          
          var script = new vm.Script(line + "\n");
          res = script.runInContext(context);
        } catch(e) {
          res = e;
        } finally {
          initMod.clearModules();
        }
        out(res + "\n");
      }
      out(SIMBOL+"> ");
    });
    // 終了処理.
    process.stdin.on('end', function () {
      out("exit!!\n");
      return 0;
    });
  }
  
  // 初期処理.
  init(env);
  
  // ファイルが指定されていない場合は、対話モード.
  if(fileName == null || fileName == _u) {
    return executeStdin();
  
  // ファイルが指定されている場合は、バッチ実行モード.
  } else {
    return executeFile(fileName);
  }
}
