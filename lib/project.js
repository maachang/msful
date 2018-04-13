// create msful project.
//

exports.createMsFulProject = function () {
  'use strict';
  var fs = require('fs');

  // プロジェクトの雛形を作成.
  fs.mkdirSync("./html");
  fs.mkdirSync("./api");

  console.log("new project!!");
  console.log(" directory [html]");
  console.log("   It stores static files (HTML, JS, CSS, Images) here.");
  console.log("");
  console.log(" directory [api]");
  console.log("   Here, we store RESTFul API programs implemented by JS.");
}
