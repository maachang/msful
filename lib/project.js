// create msful project.
//

exports.createMsFulProject = function () {
  'use strict';
  var fs = require('fs');

  // プロジェクトの雛形を作成.
  fs.mkdirSync("./html");
  fs.mkdirSync("./api");
  fs.mkdirSync("./lib");
  fs.mkdirSync("./conf");

  console.log("new project!!");
  console.log(" [html]directory.");
  console.log("   It stores static files (HTML, JS, CSS, Images) here.");
  console.log(" [api]directory ");
  console.log("   Here, we store RESTFul API programs implemented by JS.");
  console.log(" [lib]directory ");
  console.log("   This is a folder for storing JS libraries.");
  console.log(" [conf]directory ");
  console.log("   This is a folder for storing configuration information in JSON format.");
}
