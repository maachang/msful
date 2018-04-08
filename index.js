#! /usr/bin/env node

/*!
 * msful.
 * Copyright(c) 2008 masahito suzuki
 * MIT Licensed
 */

(function() {
  'use strict';
  
  // ポート取得.
  var port = null;
  if (process.argv.length > 2) {
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
