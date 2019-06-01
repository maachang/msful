// file操作 promise対応.
//
// fs の promise対応は、node 10 から対応しているが
// 下位バージョン用で用意する.
//

module.exports = (function (_g) {
  'use strict';

  var fs = require("fs");
  var o = {};

  // フォルダが存在するかチェック..
  o.isDir = function(name) {
    return new Promise(function(res) {
      fs.stat(name, function (err, stat) {
        try {
          if (err) throw err;
          res(stat.isDirectory());
        } catch(e) {
          res(false);
        }
      })
    });
  }

  // フォルダが存在するかチェック..
  o.isFile = function(name) {
    return new Promise(function(res) {
      fs.stat(name, function (err, stat) {
        try {
          if (err) throw err;
          res(stat.isFile());
        } catch(e) {
          res(false);
        }
      })
    });
  }

  // statを取得.
  o.stat = function(name) {
    return new Promise(function(res, rej) {
      fs.stat(name, function (err, stat) {
        try {
          if (err) throw err;
          res(stat);
        } catch(e) {
          rej(err);
        }
      })
    });
  }

  // ファイルを読み込む.
  o.read = function(name) {
    return new Promise(function(res, rej) {
      fs.readFile(name, function(err, data) {
        try {
          if (err) throw err;
          res(data);
        } catch(e) {
          rej(err);
        }
      })
    });
  }

  // ファイルを書き込み.
  o.write = function(name, data) {
    return new Promise(function(res, rej) {
      fs.writeFile(name, data, function(err) {
        try {
          if (err) throw err;
          res(true);
        } catch(e) {
          rej(err);
        }
      })
    });
  }

  // ファイル削除.
  o.remove = function(name) {
    return new Promise(function(res, rej) {
      fs.unlink(name, function(err) {
        try {
          if (err) throw err;
          res(true);
        } catch(e) {
          rej(err);
        }
      })
    });
  }

  // フォルダ削除.
  o.removeDir = function(name) {
    return new Promise(function(res, rej) {
      fs.rmdir(name, function(err) {
        try {
          if (err) throw err;
          res(true);
        } catch(e) {
          rej(err);
        }
      })
    });
  }

  // フォルダ作成.
  o.mkdir = function(name) {
    return new Promise(function(res, rej) {
      fs.mkdir(name, {}, function(err) {
        try {
          if (err) throw err;
          res(true);
        } catch(e) {
          rej(err);
        }
      })
    });
  }

  // リネーム.
  o.rename = function(src, dest) {
    return new Promise(function(res, rej) {
      fs.rename(src, dest, function(err) {
        try {
          if (err) throw err;
          res(true);
        } catch(e) {
          rej(err);
        }
      })
    });
  }

  // リスト取得.
  o.list = function(name) {
    return new Promise(function(res, rej) {
      fs.rename(name, function(err, files) {
        try {
          if (err) throw err;
          res(files);
        } catch(e) {
          rej(err);
        }
      })
    });
  }

  return o;
})(global);