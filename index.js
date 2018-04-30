#! /usr/bin/env node

/*!
 * msful(micro service RESTFul API Server).
 * Copyright(c) 2018 maachang.
 * MIT Licensed
 */

(function() {
  'use strict';
  
  var port = null;
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
        p = parseInt(process.argv[2]);
        if (port > 0 && port < 65535) {
          p = port;
        }
      } catch (e) {
        p = null
      }
      port = p
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
    require('./lib/index.js').createMsFUL(port);
  }
})()
