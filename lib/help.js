// help msful.
//

exports.helpMsFul = function () {
  'use strict';
  var constants = require("./constants").getConstants();

  console.log("msful version: v" + constants.VERSION);
  console.log("");
  console.log("msful [cmd]");
  console.log(" [cmd]");
  console.log("   project: Create a template for the new project.");
  console.log("   help:    Display help information.");
  console.log("   [Number] Set the server bind port number.")
  console.log("   console: At the console, run JS on line.");
  console.log("   console [file]: Run the specified file on the console.");
}
