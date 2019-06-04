#!/usr/bin/env node

/*!
 * msful(micro service RESTFul API Server).
 * Copyright(c) 2018 maachang.
 * Copyright(c) 2019 maachang.
 * MIT Licensed
 */

(function(_g) {
  'use strict';

  // クラスタ.
  var cluster = require('cluster');

  // 基本定義情報を取得..
  var constants = require('./msful/constants');

  // プロセスタイトルをセット.
  process.title = "node-" + constants.NAME;

  // コマンド引数処理.
  var argsCmd = require('./lib/subs/args');

  // サーバID生成情報を取得.
  var serverId = require("./lib/subs/serverId");

  // 数値情報.
  var nums = require("./lib/nums");

  // ファイル情報.
  var file = require("./lib/file");

  // msfulLoggerをグローバル展開.
  var logger = require("./msful/logger");
  _g.msfulLogger = function() {
    return logger;
  }

  // systemNanoTimeを保持するファイル名.
  var _SYSTEM_NANO_TIME_FILE = "./.systemNanoTime";

  // systemNanoTimeを生成.
  var _createSystemNanoTime = function() {
    var nano = nums.getNanoTime();
    file.writeByString(_SYSTEM_NANO_TIME_FILE, ""+ nano);
    return nano;
  }

  // systemNanoTimeを取得.
  var _getSystemNanoTime = function() {
    return parseInt(file.readByString(_SYSTEM_NANO_TIME_FILE));
  }

  // コンフィグ情報.
  var conf = null;

  // スタートアップ情報.
  var users = null;

  // コマンド引数.
  var p = null;
  var port = null;
  var timeout = null;
  var contentsCache = null;
  var contentsClose = null;
  var env = null;
  var cmd = null;
  var consoleFlag = false;
  var maxClusterSize = null;
  var file = require("./lib/file");

  // 起動パラメータをargsCmdにセット.
  var argv_params = argsCmd.getArgv();

  // パラメータ取得.
  port = argsCmd.registrationParams("number", "number Set the server bind port number.", ["-p", "--port"]);
  timeout = argsCmd.registrationParams("number", "Set HTTP response timeout value.", ["-t", "--timeout"]);
  contentsCache = argsCmd.registrationParams("boolean", "[true/false] Configure the content cache.",["-c", "--cache"]);
  contentsClose = argsCmd.registrationParams("boolean", "[true/false] Close after sending content.",["-s", "--close"]);
  env = argsCmd.registrationParams("string", "Set the execution environment conditions of msful.", ["-e", "--env"]);
  maxClusterSize = argsCmd.registrationParams("number", "Set the number of clusters of HTTP execution part of msful.", ["-l", "--cluster"]);

  // クラスタサイズが設定されていない場合は、CPU数に合わせる.
  if(!maxClusterSize) {
    try {
      if ((p = parseInt(process.env[constants.ENV_CLUSTER])) > 0) {
        maxClusterSize = p;
      }
    } catch(e) {}
    if(!maxClusterSize) {
      maxClusterSize = require('os').cpus().length;
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
        require('./msful/project.js').create("" + argv_params[3]);
      } else {
        require('./msful/project.js').create();
      }
      return;
    
    // ヘルプ.
    } else if (cmd == "help" || cmd == "-h") {
      // ヘルプ情報を表示.
      require('./msful/help.js').help(argsCmd);
      return;
    
    // サーバIDを再生成.
    } else if (cmd == "msfulId") {
      // サーバIDを再生成して終了.
      var msfulId = serverId.createId();
      console.log("new id: " + msfulId);
      return;
    
    // バージョン情報を出力.
    } else if (cmd == "version" || cmd == "-v") {
      constants.viewTitle(console.log, false);
      return;

    // バージョン番号だけを表示.
    } else if (cmd == "-version" || cmd == "--v") {
      console.log(constants.VERSION);
      return;
      
    // コンソール実行.
    } else if (cmd == "console") {
      // コンソール実行.
      consoleFlag = true;
    }
  }

  // argsCmdのヘルプ情報を破棄.
  argsCmd.destroy();

  // プロジェクトが存在するかチェック.
  if(!file.isDir(constants.HTML_DIR) ||
    !file.isDir(constants.API_DIR) ||
    !file.isDir(constants.CONF_DIR) ||
    !file.isDir(constants.LIB_DIR)) {
    console.log("not msful project directory.");
    process.exit(1);
  }

  // サーバIDを生成.
  var msfulId = serverId.getId();

  // クラスタがマスターでない、コンソール起動の場合.
  if(!cluster.isMaster || consoleFlag) {
    // 実行環境名を取得.
    var targetEnv = env;
    if(!targetEnv) {
      targetEnv = process.env[constants.ENV_ENV];
      if(!targetEnv) {
        // 何も設定されていない場合のデフォルト値.
        targetEnv = constants.DEFAULT_ENV;
      }
    }

    // コンフィグ情報.
    conf = require("./msful/conf")(constants.CONF_DIR);

    // 実行環境用のコンフィグが存在する場合は、そちらを取得.
    var envConf = (!conf.getConfig()[targetEnv]) ?
      conf.getConfig() : conf.getConfig()[targetEnv];

    // スタートアップ処理.
    users = require("./msful/startup")(_g, envConf, targetEnv, consoleFlag, msfulId);
    if(!users) {
      users = {};
    }
  }

  // コンソール実行.
  if (consoleFlag) {
    var cons = require("./msful/exec/console");
    if(argv_params.length > 3) {

      // サーバの最後に起動した起動時間を取得.
      var nanoTime = file.isFile(_SYSTEM_NANO_TIME_FILE) ?
        _getSystemNanoTime() : nums.getNanoTime();

      cons.create(
        _g, "" + argv_params[3], users, conf, env, msfulId, nanoTime);
    } else {
      cons.create(
        _g, null, users, conf, env, msfulId, nums.getNanoTime());
    }
    return;
  }

  // クラスタ起動.
  if (cluster.isMaster) {

    // psyncを初期化.
    require("./lib/psync")(nanoTime).init();

    // nanoTimeを生成.
    var nanoTime = _createSystemNanoTime();
    
    // 起動時に表示する内容.
    constants.viewTitle(function(n){console.log(n);}, false);
    console.log(" id: " + msfulId);
    console.log("");
    constants = null;
    
    // マスター起動.
    for (var i = 0; i < maxClusterSize; ++i) {
      cluster.fork();
    }

    // プロセスが落ちた時の処理.
    var _exitNode = function() {
      process.exit();
    };

    // node処理終了.
    process.on('exit', function() {
      // プロセスが落ちる前に処理したい内容があれば、ここにセット.

    });

    // 割り込み系と、killコマンド終了.
    process.on('SIGINT', _exitNode);
    process.on('SIGBREAK', _exitNode);
    process.on('SIGTERM', _exitNode);

    // クラスタプロセスが落ちた場合、再起動.
    cluster.on('exit', function () {
      console.debug("## cluster exit to reStart.")
      cluster.fork();
    });

  } else {
    
    // ワーカー起動.
    require('./msful/index.js').create(
      _g, users, conf, port, timeout, contentsCache,
      contentsClose, env, msfulId, _getSystemNanoTime());
  }
})(global)
