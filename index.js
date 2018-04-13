#! /usr/bin/env node

/*!
 * msful(micro service RESTFul API Server).
 * Copyright(c) 2018 masahito suzuki.
 * MIT Licensed
 */

(function() {
  'use strict';
  
  var port = null;
  var cmd = null;
  // コマンドが存在するかチェック.
  if (process.argv.length > 2) {
    cmd = "" + process.argv[2];
  }
  if (cmd != null) {
    if (cmd == "project") {
      // 新規プロジェクトを作成.
      require('./lib/project.js').createMsFulProject();
      return;
    } else if (cmd == "help" || cmd == "-h" || cmd == "--help") {
      // ヘルプ情報を表示.
      require('./lib/help.js').helpMsFul();
      return;
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

  // クラスタ起動.
  var cluster = require('cluster');
  var MAX_SERVER = require('os').cpus().length;
  if (cluster.isMaster) {
    
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
