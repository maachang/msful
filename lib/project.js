// create msful project.
//

exports.createMsFulProject = function () {
  'use strict';
  var constants = require("./constants").getConstants();
  var fs = require('fs');

  // プロジェクトの雛形を作成.
  fs.mkdirSync(constants.HTML_DIR);
  fs.mkdirSync(constants.API_DIR);
  fs.mkdirSync(constants.LIB_DIR);
  fs.mkdirSync(constants.CONF_DIR);

  console.log("new project!! version: v" + constants.VERSION);
  console.log(" ["+constants.HTML_DIR.substring(2)+"]directory.");
  console.log("   It stores static files (HTML, JS, CSS, Images) here.");
  console.log(" ["+constants.API_DIR.substring(2)+"]directory ");
  console.log("   Here, we store RESTFul API programs implemented by JS.");
  console.log(" ["+constants.LIB_DIR.substring(2)+"]directory ");
  console.log("   This is a folder for storing JS libraries.");
  console.log(" ["+constants.CONF_DIR.substring(2)+"]directory ");
  console.log("   This is a folder for storing configuration information in JSON format.");
}
