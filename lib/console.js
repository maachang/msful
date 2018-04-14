// console msful.
//

exports.createConsole = function (fileName) {
  'use strict';
  var _u = undefined;
  var SIMBOL = "";
  var constants = require("./constants").getConstants();
  
  // モジュール群.
  var _MODULES = {};
  
  // コンフィグ群.
  var _CONFIG = {};
  
  // モジュール群とコンフィグ群を取得.
  var init = function() {
    // モジュール初期処理.
    var initMod = require("./modules/init")
    
    // デフォルトのモジュールを読み込む.
    initMod.loadModules(_MODULES);
    
    // コンフィグ情報を読み込む.
    initMod.readConfig(_CONFIG, constants.CONF_DIR);
    initMod = null;
  }
  
  // モジュールをグローバルセット.
  var setModules = function(out) {
    for(var k in global) {
      out[k] = global[k];
    }
    for(var k in _MODULES) {
      out[k] = _MODULES[k];
    }
    for(var k in _CONFIG) {
      out[k] = _CONFIG[k];
    }
    out["require"] = require;
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
    
    // 実行処理.
    var script = new vm.Script(srcScript);
    srcScript = null;
    return script.runInContext(context);
  }
  
  // stdinで実行.
  var executeStdin = function() {
    
    // 起動時に表示する内容.
    process.stdout.write(constants.NAME+"(" + constants.DETAIL_NAME + ") v" + constants.VERSION + "\n");
    process.stdout.write(constants.COPY_RIGHT + "\n");
    process.stdout.write(SIMBOL+">\n");
    process.stdout.write(SIMBOL+"> ");
    
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
    // ライン実行.
    reader.on('line', function (line) {
      var res = null
      if(line == null || line == _u || line.length == 0) {
        res = "";
      } else if(line == "!!clear") {
        memory = {};
        context = vm.createContext(memory);
        process.stdout.write("clear memory!!\n");
      } else if(line == "exit" || line == "end") {
        reader.close();
        return 0;
      } else {
        try {
          // モジュール再設定.
          setModules(memory);
          var script = new vm.Script(line + "\n");
          res = script.runInContext(context);
          process.stdout.write(res + "\n");
        } catch(e) {
          res = e;
          process.stdout.write(res + "\n");
        }
      }
      process.stdout.write(SIMBOL+"> ");
    });
    // 終了処理.
    process.stdin.on('end', function () {
      process.stdout.write("exit!!\n");
      return 0;
    });
  }
  
  // 初期処理.
  init();
  
  // ファイルが指定されていない場合は、対話モード.
  if(fileName == null || fileName == _u) {
    return executeStdin();
  
  // ファイルが指定されている場合は、バッチ実行モード.
  } else {
    return executeFile(fileName);
  }
}
