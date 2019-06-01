// msful 基本ロガー.
//
// 簡易的なログ出力を行います.
// 大量のログ出力を行うには向いていません.
//
//

module.exports = (function () {
  'use strict';
  var _u = undefined;

  var zlib = require("zlib");
  var o = {};

  // ログ出力先ディレクトリ.
  var outLogDir = "./log/";

  // ログ出力レベル.
  // 0: trace, 1: debug, 2: info, 3: warn, 4: error, 5: fatal.
  var outLogLevel = 1;

  // １ファイルの最大サイズ(1MByte).
  var outFileSize = 0x00100000;

  // 日付出力.
  var dateTime = function() {
    var n = null;
    var date = new Date();
    return date.getFullYear() + "/" +
      "00".substring((n = ""+(date.getMonth()+1)).length) + n + "/" +
      "00".substring((n = ""+date.getDate()).length) + n + " " +
      "00".substring((n = ""+date.getHours()).length) + n + ":" +
      "00".substring((n = ""+date.getMonth()).length) + n + ":" +
      "00".substring((n = ""+date.getSeconds()).length) + n + "." +
      "000".substring((n = ""+date.getMilliseconds()).length) + n;
  }

  // ログフォーマット.
  var format = function(t, m, e) {
    var ret = "[" + dateTime() + "] [" + t + "] " + m;
    if(e && e["stack"]) {
      ret += "\n" + e.stack;
    }
    return ret + "\n";
  }

  // 文字指定のログレベルを、数値に変換.
  var strLogLevelByNumber = function(level) {
    level = ("" + level).toLowerCase();
    switch(level) {
      case "trace": return 0;
      case "debug": return 2;
      case "dev": return 2;
      case "info": return 2;
      case "normal": return 2;
      case "warn": return 3;
      case "warning": return 3;
      case "error": return 4;
      case "fatal": return 5;
    }
    return 1;
  }
  
  // ログ出力.
  var outLog = async function(name, logLevel, fileSize, typeNo, message, err) {
    logLevel = logLevel|0;
    fileSize = fileSize|0;
    typeNo = typeNo|0;
    if(typeNo >= logLevel) {
      setImmediate(function() {
        var s = fileSize; fileSize = null;
        var n = name; name = null;
        var t = typeNo; typeNo = null;
        var m = message; message = null;
        var e = err; err = null;
        var type = "";
        var f = null;
        switch(t) {
          case 0:
            type = "TRACE";
            f = format(type, m, e);
            process.stdout.write(f);
            break;
          case 1:
            type = "DEBUG";
            f = format(type, m, e);
            process.stdout.write(f);
            break;
          case 2:
            type = "INFO";
            f = format(type, m, e);
            process.stdout.write(f);
            break;
          case 3:
            type = "WARN";
            f = format(type, m, e);
            process.stdout.write(f);
            break;
          case 4:
            type = "ERROR";
            f = format(type, m, e);
            process.stdout.write(f);
            break;
          case 5:
            type = "FATAL";
            f = format(type, m, e);
            process.stdout.write(f);
            break;
        }
        var outName = outLogDir + n + ".log";
        // ファイルサイズ制限が設定されている場合.
        if(s > 0) {
          fs.stat(outName, function(err, value) {
            // ファイルサイズ制限に達した場合.
            if(!err && value.size + f.length > s) {
              while(true) {
                var mvName = outName + "." + Date.now() + ".log";
                try {
                  // リネーム.
                  fs.renameSync(outName, mvName);
                  
                  // ファイル出力.
                  fs.appendFile(outName, f, "utf-8",function(){

                    // 前の情報をgz圧縮.
                    var gzip = zlib.createGzip();
                    var src = fs.createReadStream(mvName);
                    var dest = fs.createWriteStream(mvName + ".gz");
                    src.pipe(gzip).pipe(dest);

                    // 前のファイルを削除.
                    fs.unlinkSync(mvName);
                  });
                  return;
                } catch(e) {
                  return;
                }
              }
            }
            // ファイルサイズ範囲内の場合は、通常出力(非同期).
            fs.appendFile(outName, f, "utf-8",function(){});
          });
        // ファイルサイズ制限が設定されていない場合(非同期).
        } else {
          fs.appendFile(outName, f, "utf-8",function(){});
        }
      });
    }
  }

  // デフォルトのログ出力条件を設定します.
  // level: ログレベルを設定します.
  // fileSize: ログ出力ファイルサイズを設定します.
  // dir: ログ出力先フォルダを設定します.
  o.setting = function(level, fileSize, dir) {
    if(level != _u) {
      if(typeof(level) == "string") {
        level = strLogLevelByNumber(level);
      }
      outLogLevel = level|0;
    }
    if(fileSize != _u) {
      outFileSize = fileSize|0;
      outFileSize = outFileSize < 0 ? 0 : outFileSize;
    }
    if(dir) {
      outLogDir = dir;
      if(outLogDir.lastIndexOf("/") == outLogDir.length - 1) {
        outLogDir = outLogDir + "/";
      }
    }
  }

  // デフォルトの設定ログレベルを取得.
  o.logLevel = function() {
    return outLogLevel;
  }

  // デフォルトのログ出力先フォルダを取得.
  o.logDir = function() {
    return outLogDir;
  }

  // デフォルトの１つのログファイルサイズを設定します.
  o.maxFileSize = function() {
    return outFileSize;
  }

  // ログ情報生成.
  o.create = function(name, logLevel, fileSize) {
    // 出力ファイル名.
    var _name = name; name = null;

    // ログ出力レベル.
    if(logLevel != _u) {
      if(typeof(logLevel) == "string") {
        logLevel = strLogLevelByNumber(logLevel);
      }
      var _outLogLevel = (logLevel == _u) ?  outLogLevel: logLevel|0;
    } else {
      var _outLogLevel = outLogLevel
    }

    // １ファイルの最大サイズ.
    var _maxFileSize = (fileSize == _u) ? outFileSize: fileSize|0;
    _maxFileSize = (_maxFileSize < 0) ? 0 : _maxFileSize;

    return {
      trace: function(m, e) {
        outLog(_name, _outLogLevel, _maxFileSize, 0, m, e);
      },
      log: function(m, e) {
        outLog(_name, _outLogLevel, _maxFileSize, 0, m, e);
      },
      debug: function(m, e) {
        outLog(_name, _outLogLevel, _maxFileSize, 1, m, e);
      },
      info: function(m, e) {
        outLog(_name, _outLogLevel, _maxFileSize, 2, m, e);
      },
      warn: function(m, e) {
        outLog(_name, _outLogLevel, _maxFileSize, 3, m, e);
      },
      error: function(m, e) {
        outLog(_name, _outLogLevel, _maxFileSize, 4, m, e);
      },
      fatal: function(m, e) {
        outLog(_name, _outLogLevel, _maxFileSize, 5, m, e);
      },
      logLevel: function() {
        return _outLogLevel;
      },
      maxFileSize: function() {
        return _maxFileSize;
      },
      name: function() {
        return _name;
      }
    }
  }

  return o;
})();