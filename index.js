#!/usr/bin/env node

/*!
 * msful(micro service RESTFul API Server).
 * Copyright(c) 2018 maachang.
 * Copyright(c) 2019 maachang.
 * MIT Licensed
 */

(function() {
  'use strict';

  // 基本定義情報を取得..
  var constants = require('./lib/constants.js');
  
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

  // 環境変数を取得.
  var getEnv = function(name) {
    return process.env[name];
  }
  
  var port = null;
  var timeout = null;
  var contentsCache = null;
  var env = null;
  var cmd = null;
  var consoleFlag = false;
  var maxClusterSize = require('os').cpus().length;

  // コマンドが存在するかチェック.
  if (process.argv.length > 2) {
    cmd = "" + process.argv[2];
  }

  // コマンド設定が行われている場合.
  if (cmd != null) {

    // プロジェクト.
    if (cmd == "project") {
      // 新規プロジェクトを作成.
      if(process.argv.length > 3) {
        require('./lib/project.js').createMsFulProject("" + process.argv[3]);
      } else {
        require('./lib/project.js').createMsFulProject();
      }
      return;
    
    // ヘルプ.
    } else if (cmd == "help" || cmd == "-h" || cmd == "--help") {
      // ヘルプ情報を表示.
      require('./lib/help.js').helpMsFul();
      return;
    
    // コンソール実行.
    } else if (cmd == "console" || cmd == "con") {
      // コンソール実行.
      consoleFlag = true;
    }
  }

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
  p = null
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
  p = null
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

  // 環境設定を取得.
  p = null
  try {
    p = getCmdArgs("-e", "--env");
    if(p) {
      env = p;
    } 
  } catch (e) {
    env = null;
  }

  // クラスタ数を設定.
  p = null
  try {
    p = parseInt(getCmdArgs("-l", "--cluster"));
  } catch (e) {
    p = null;
  }
  if (p > 0) {
    maxClusterSize = p;
  } else {
    try {
      if ((p = parseInt(getEnv(constants.ENV_CLUSTER))) > 0) {
        maxClusterSize = p;
      }
    } catch(e) {
    }
  }
  
  // 必要なフォルダ構成をチェック.
  var fs = require("fs");
  fs.statSync(constants.HTML_DIR);
  fs.statSync(constants.API_DIR);
  fs.statSync(constants.CONF_DIR);
  fs.statSync(constants.LIB_DIR);
  fs = null;
  
  // コンソール実行.
  if (consoleFlag) {
    var cons = require("./lib/console", env);
    if(process.argv.length > 3) {
      cons.createConsole("" + process.argv[3], env);
    } else {
      cons.createConsole();
    }
    return;
  }

  // クラスタ起動.
  var cluster = require('cluster');
  if (cluster.isMaster) {
    
    // 起動時に表示する内容.
    constants.viewTitle(function(n){console.log(n);}, false);
    console.log("");
    constants = null;
    
    // マスター起動.
    for (var i = 0; i < maxClusterSize; ++i) {
      cluster.fork();
    }
    cluster.on('exit', function (worker, code, signal) {
      console.debug("## cluster exit to reStart.")
      cluster.fork();
    });
  } else {
    
    // ワーカー起動.
    require('./lib/index.js').createMsFUL(port, timeout, contentsCache, env);
  }
})()
