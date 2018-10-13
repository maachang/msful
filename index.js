#! /usr/bin/env node

/*!
 * msful(micro service RESTFul API Server).
 * Copyright(c) 2018 maachang.
 * MIT Licensed
 */

(function() {
  'use strict';
  
  // コマンド引数取得.
  var getCmdArgs = function() {
    var names = arguments;
    var nlen = names.length;
    var args = process.argv;
    var len = args.length;
    for(var i = 2; i < len; i ++) {
      for(var j = 0; j < nlen; j ++) {
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
  
  var port = null;
  var timeout = null;
  var contentsCache = null;
  var cmd = null;
  var consoleFlag = false;
  // コマンドが存在するかチェック.
  if (process.argv.length > 2) {
    cmd = "" + process.argv[2];
  }
  if (cmd != null) {
    if (cmd == "project") {
      // 新規プロジェクトを作成.
      if(process.argv.length > 3) {
        require('./lib/project.js').createMsFulProject("" + process.argv[3]);
      } else {
        require('./lib/project.js').createMsFulProject();
      }
      return;
    } else if (cmd == "help" || cmd == "-h" || cmd == "--help") {
      // ヘルプ情報を表示.
      require('./lib/help.js').helpMsFul();
      return;
    } else if (cmd == "console" || cmd == "con") {
      // コンソール実行.
      consoleFlag = true;
    } else {
      // ポート取得.
      var p = null
      try {
        p = parseInt(getCmdArgs("-p", "--port"));
        if (!(p > 0 && p < 65535)) {
          p = null;
        }
      } catch (e) {
        p = null
      }
      port = p
      // タイムアウト取得.
      try {
        p = parseInt(getCmdArgs("-t", "--timeout"));
        if (p <= 0) {
          p = null;
        }
      } catch (e) {
        p = null
      }
      timeout = p
      // コンテンツキャッシュ情報を取得.
      try {
        p = getCmdArgs("-c", "--cache");
        if(p == "true" || p == "t") {
          contentsCache = true;
        } else if(p == "false" || p == "f") {
          contentsCache = false;
        }
      } catch (e) {
        contentsCache = null;
      }
    }
  }
  
  // 必要なフォルダ構成をチェック.
  var constants = require('./lib/constants.js').get;
  var fs = require("fs");
  fs.statSync(constants.HTML_DIR);
  fs.statSync(constants.API_DIR);
  fs.statSync(constants.CONF_DIR);
  fs.statSync(constants.LIB_DIR);
  fs = null;
  
  // コンソール実行.
  if (consoleFlag) {
    var cons = require("./lib/console");
    if(process.argv.length > 3) {
      cons.createConsole("" + process.argv[3]);
    } else {
      cons.createConsole();
    }
    return;
  }

  // クラスタ起動.
  var cluster = require('cluster');
  var MAX_SERVER = require('os').cpus().length;
  if (cluster.isMaster) {
    
    // 起動時に表示する内容.
    constants.viewTitle(function(n){console.log(n);}, false);
    console.log("");
    constants = null;
    
    // マスター起動.
    for (var i = 0; i < MAX_SERVER; ++i) {
      cluster.fork();
    }
    cluster.on('exit', function (worker, code, signal) {
      cluster.fork();
    });
  } else {
    
    // ワーカー起動.
    require('./lib/index.js').createMsFUL(port, timeout, contentsCache);
  }
})()
