// create msful project.
//

// プロジェクト名を指定した場合、そのプロジェクト名のフォルダを作成し
// その下に各フォルダをセットする.
exports.createMsFulProject = function (projectName) {
  'use strict';
  var out = function(n) {process.stdout.write(n);}
  var constants = require("./constants").get;
  var fs = require('fs');
  
  var htmlDir = constants.HTML_DIR.substring(2);
  var apiDir = constants.API_DIR.substring(2);
  var libDir = constants.LIB_DIR.substring(2);
  var confDir = constants.CONF_DIR.substring(2);
  
  // プロジェクト名が設定されている場合は、フォルダを作成して、
  // その下にプロジェクトフォルダ構成を作成する.
  var baseDir = "./";
  if(projectName != null && projectName != undefined) {
    baseDir = "./" + projectName + "/" ;
    try { fs.mkdirSync(baseDir); } catch(e) {}
  } else {
    // 現在のフォルダ名をプロジェクト名として取得.
    var fullPath = require('path').resolve("./");
    var p = fullPath.lastIndexOf("\\");
    var pp = fullPath.lastIndexOf("/");
    if(pp > p) {
      p = pp;
    }
    if(p == -1) {
      projectName = fullPath;
    } else {
      projectName = fullPath.substring(p+1);
    }
  }

  // プロジェクトの雛形を作成.
  try { fs.mkdirSync(baseDir + htmlDir); } catch(e) {}
  try { fs.mkdirSync(baseDir + apiDir); } catch(e) {}
  try { fs.mkdirSync(baseDir + libDir); } catch(e) {}
  try { fs.mkdirSync(baseDir + confDir); } catch(e) {}
  
  // package.jsonを新規プロジェクト用に生成してコピー.
  var value = fs.readFileSync(__dirname + "/../project/package.json");
  var strs = require("./modules/strs");
  value = strs.changeString(value, "{{projectName}}", projectName);
  value = strs.changeString(value, "{{user}}", process.env.username || process.env.username.USER);
  fs.writeFileSync("./package.json", value);
  
  // 処理結果を表示.
  constants.viewTitle(out);
  out("\n");
  if(projectName != null) {
    out("new " + projectName + " project.\n");
  } else {
    out("new project.\n");
  }
  out(" ["+htmlDir+"]directory.\n");
  out("   It stores static files (HTML, JS, CSS, Images) here.\n");
  out(" ["+apiDir+"]directory ");
  out("   Here, we store RESTFul API programs implemented by JS.\n");
  out(" ["+libDir+"]directory.\n");
  out("   This is a folder for storing JS libraries.\n");
  out(" ["+confDir+"]directory.\n");
  out("   This is a folder for storing configuration information in JSON format.\n");
}
