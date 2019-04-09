// help msful.
//

module.exports.helpMsFul = function () {
  'use strict';
  var out = function(n) {process.stdout.write(n);}
  var constants = require("./constants");
  constants.viewTitle(out);
  out("\n");
  out("msful [cmd]\n");
  out(" [cmd]\n");
  out("   project: Create a template for the new project.\n");
  out("   project [name]: Expand the project structure under the project name folder.\n");
  out("   help:    Display help information.\n");
  out("   console: At the console, run JS on line.\n");
  out("   console [file]: Run the specified file on the console.\n");
  out("   -p [--port] number Set the server bind port number.\n");
  out("   -e [--env] Set the execution environment conditions of msful.\n");
  out("   -c [--cache] [true/false] Configure the content cache.\n");
  out("   -t [--timeout] Set HTTP response timeout value.\n");
  out("   -l [--cluster] Set the number of clusters of HTTP execution part of msful.\n");
  out("\n");
}
