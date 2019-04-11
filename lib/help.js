// help msful.
//

module.exports.helpMsFul = function (argsCmd) {
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
  out("   msfulId: Regenerate server ID. \n")
  out(argsCmd.getHelp());
  out("\n");
}
