#! /usr/bin/env node

/*!
 * msful.
 * Copyright(c) 2008 masahito suzuki
 * MIT Licensed
 */

(function() {
  'use strict';
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
  require('./lib/index.js').createMsFUL(port);
})()
