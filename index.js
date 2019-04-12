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
  var constants = require('./lib/constants');

  // コマンド引数処理.
  var argsCmd = require('./lib/modules/subs/args');

  // サーバID生成情報を取得.
  var serverId = require("./lib/modules/subs/serverId");

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

  // 起動パラメータをargsCmdにセット.
  var argv_params = argsCmd.getArgv();

  // ポート取得.
  var p = null
  try {
    p = parseInt(argsCmd.get("number Set the server bind port number.", "-p", "--port"));
    if (!(p > 0 && p < 65535)) {
      p = null;
    } else {
      argsCmd.remove("-p", "--port");
    }
  } catch (e) {
    p = null
  }
  port = p

  // タイムアウト取得.
  p = null
  try {
    p = parseInt(argsCmd.get("Set HTTP response timeout value.", "-t", "--timeout"));
    if (p <= 0) {
      p = null;
    } else {
      argsCmd.remove("-t", "--timeout");
    }
  } catch (e) {
    p = null
  }
  timeout = p

  // コンテンツキャッシュ情報を取得.
  p = null
  try {
    p = argsCmd.get("[true/false] Configure the content cache.", "-c", "--cache");
    if(p == "true" || p == "t") {
      contentsCache = true;
      argsCmd.remove("-c", "--cache");
    } else if(p == "false" || p == "f") {
      contentsCache = false;
      argsCmd.remove("-c", "--cache");
    }
  } catch (e) {
    contentsCache = null;
  }

  // 環境設定を取得.
  p = null
  try {
    p = argsCmd.get("Set the execution environment conditions of msful.", "-e", "--env");
    if(p) {
      env = p;
      argsCmd.remove("-e", "--env");
    } 
  } catch (e) {
    console.log(e)
    env = null;
  }

  // クラスタ数を設定.
  p = null
  try {
    p = parseInt(argsCmd.get("Set the number of clusters of HTTP execution part of msful.", "-l", "--cluster"));
  } catch (e) {
    p = null;
  }
  if (p > 0) {
    maxClusterSize = p;
    argsCmd.remove("-l", "--cluster");
  } else {
    try {
      if ((p = parseInt(getEnv(constants.ENV_CLUSTER))) > 0) {
        maxClusterSize = p;
      }
    } catch(e) {
    }
  }

  // コマンドが存在するかチェック.
  if (argv_params.length > 2) {
    cmd = "" + argv_params[2];
  }

  // コマンド設定が行われている場合.
  if (cmd != null) {

    // プロジェクト.
    if (cmd == "project") {
      // 新規プロジェクトを作成.
      if(argv_params.length > 3) {
        require('./lib/project.js').createMsFulProject("" + argv_params[3]);
      } else {
        require('./lib/project.js').createMsFulProject();
      }
      return;
    
    // ヘルプ.
    } else if (cmd == "help") {
      // ヘルプ情報を表示.
      require('./lib/help.js').helpMsFul(argsCmd);
      return;
    
    // サーバIDを再生成.
    } else if (cmd == "msfulId") {
      // サーバIDを再生成して終了.
      var msfulId = serverId.createId();
      console.log("new id: " + msfulId);
      return;
    
    // バージョン情報を出力.
    } else if (cmd == "version") {
      constants.viewTitle(console.log, false);
      return;

    // コンソール実行.
    } else if (cmd == "console") {
      // コンソール実行.
      consoleFlag = true;
    }
  }

  // argsCmdのヘルプ情報を破棄.
  argsCmd.destroy();
  
  // 必要なフォルダ構成をチェック.
  var fs = require("fs");
  fs.statSync(constants.HTML_DIR);
  fs.statSync(constants.API_DIR);
  fs.statSync(constants.CONF_DIR);
  fs.statSync(constants.LIB_DIR);
  fs = null;

  // サーバIDを生成.
  var msfulId = serverId.getId();

  // コンソール実行.
  if (consoleFlag) {
    var cons = require("./lib/console");
    if(argv_params.length > 3) {
      cons.createConsole("" + argv_params[3], env, msfulId);
    } else {
      cons.createConsole(null, env, msfulId);
    }
    return;
  }

  // クラスタ起動.
  var cluster = require('cluster');
  if (cluster.isMaster) {
    
    // 起動時に表示する内容.
    constants.viewTitle(function(n){console.log(n);}, false);
    console.log(" id: " + msfulId);
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
    require('./lib/index.js').createMsFUL(port, timeout, contentsCache, env, msfulId);
  }
})()
