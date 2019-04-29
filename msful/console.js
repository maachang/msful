// console msful.
//

module.exports.createConsole = function (fileName, args_env, msfulId, systemNanoTime) {
  'use strict';
  var _u = undefined;
  var out = function(n) {process.stdout.write(n);}
  var SIMBOL = "";
  var constants = require("./constants");
  var core = require("./core");
  
  var cacheRequire = {cache:{}, time:Date.now()};
  var backupRequire = {cache:{}, time:Date.now()};
  
  // モジュール群とコンフィグ群を取得.
  var init = function(env, id, nanoTime) {

    // コア条件を設定.
    core.setting(constants.CONF_DIR, env, id, nanoTime);

    // デフォルトのモジュールを読み込む.
    core.resetModules();
    core.loadModules(true);
  }
  
  // モジュールをセット.
  var setModules = function(out) {
    core.setDefaults(out);
    var modules = core.getModules();
    for(var k in modules) {
      out[k] = modules[k];
    }
    
    // グローバルメモリにmsful固有条件をセット.
    core.setMsfulGlobals(out);
  }
  
  // ロゴ表示.
  var viewLogo = function(id) {
    constants.viewTitle(out);
    out(SIMBOL);
    out(" id: " + msfulId + "\n\n");
  }
  
  // 指定ファイルを実行.
  var executeFile = function(fileName) {

    // cmd終了時に安全に終了結果を送る.
    var exitCode = 0;
    process.on('exit', function() {
      process.exit(exitCode);
    });

    try {

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
        require("./require")(
          cacheRequire,
          backupRequire,
          core.getModules(),
          core.getConfig(),
          core.getConfigEnv()
        )
      );
      
      // 初期化が必要な処理を実行.
      core.createModules(null, null, null, true);
      
      // 実行処理.
      var script = new vm.Script(srcScript);
      srcScript = null;
      script.runInContext(context);
      return;
    } catch(e) {
      exitCode = 1;
      return;
    } finally {
      core.clearModules();
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
        core.createModules(null, null, null, true);
        out("clear memory!!\n");
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
            require("./require")(
              cacheRequire,
              backupRequire,
              core.getModules(),
              core.getConfig(),
              core.getConfigEnv()
            )
          );
          
          // 初期化が必要な処理を実行.
          core.createModules(null, null, null, true);
          
          var script = new vm.Script(line + "\n");
          res = script.runInContext(context);
        } catch(e) {
          res = e;
        } finally {
          core.clearModules();
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
  init(args_env, msfulId, systemNanoTime);
  
  // ファイルが指定されていない場合は、対話モード.
  if(fileName == null || fileName == _u) {
    return executeStdin();
  
  // ファイルが指定されている場合は、バッチ実行モード.
  } else {
    return executeFile(fileName);
  }
}
