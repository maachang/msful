// msful 基本ロガー.
//
// 簡易的なログ出力を行います.
// 大量のログ出力を行うには向いていません.
//
//

module.exports = (function () {
  'use strict';
  var _u = undefined;

  var fs = require("fs");
  var zlib = require("zlib");
  var o = {};

  // ログ出力先ディレクトリ.
  var outLogDir = "./log/";

  // ログ出力レベル.
  // 0: trace, 1: debug, 2: info, 3: warn, 4: error, 5: fatal.
  var outLogLevel = 1;

  // １ファイルの最大サイズ(1MByte).
  var outFileSize = 0x00100000;

  // 日付変更チェック用.
  var _TO32 = [
    "0","1","2","3","4","5","6","7",
    "8","9","A","B","C","D","E","F",
    "G","H","I","J","K","L","M","N",
    "O","P","Q","R","S","T","U","V"
  ];
  var _toDate = function(d) {
    return _TO32[d.getYear() & 31] + _TO32[d.getMonth()] + _TO32[d.getDate()];
  }

  // 日付情報を取得.
  var dateString = function(d) {
    var n = null;
    d = (d == _u) ? new Date() : d;
    return d.getFullYear() + "-" +
      "00".substring((n = ""+(d.getMonth()+1)).length) + n + "-" +
      "00".substring((n = ""+d.getDate()).length) + n;
  }

  // 日付時間出力.
  var dateTime = function() {
    var n = null;
    var date = new Date();
    return date.getFullYear() + "/" +
      "00".substring((n = ""+(date.getMonth()+1)).length) + n + "/" +
      "00".substring((n = ""+date.getDate()).length) + n + " " +
      "00".substring((n = ""+date.getHours()).length) + n + ":" +
      "00".substring((n = ""+date.getMinutes()).length) + n + ":" +
      "00".substring((n = ""+date.getSeconds()).length) + n + "." +
      "000".substring((n = ""+date.getMilliseconds()).length) + n;
  }

  // ログフォーマットを生成.
  var format = function(t, args) {
    var ret = "[" + dateTime() + "] [" + t + "] ";
    var m = null;
    var len = args.length;
    for(var i = 0; i < len; i ++) {
      if((m = args[i]) && m["stack"]) {
        ret += "\n" + m.stack + "\n";
      } else {
        ret += m + " ";
      }
    }
    return ret + "\n";
  }

  // 文字指定のログレベルを、数値に変換.
  var strLogLevelByNumber = function(level) {
    level = ("" + level).toLowerCase();
    switch(level) {
      case "trace": return 0;
      case "debug": return 1;
      case "dev": return 1;
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
  var outLog = async function(name, logLevel, fileSize, typeNo, args) {
    logLevel = logLevel|0;
    fileSize = fileSize|0;
    typeNo = typeNo|0;
    if(typeNo >= logLevel) {
      setImmediate(function() {
        var s = fileSize; fileSize = null;
        var n = name; name = null;
        var t = typeNo; typeNo = null;
        var a = args; args = null;
        var type = "";
        var f = null;
        switch(t) {
          case 0:
            type = "TRACE";
            f = format(type, a);
            process.stdout.write(f);
            break;
          case 1:
            type = "DEBUG";
            f = format(type, a);
            process.stdout.write(f);
            break;
          case 2:
            type = "INFO";
            f = format(type, a);
            process.stdout.write(f);
            break;
          case 3:
            type = "WARN";
            f = format(type, a);
            process.stdout.write(f);
            break;
          case 4:
            type = "ERROR";
            f = format(type, a);
            process.stdout.write(f);
            break;
          case 5:
            type = "FATAL";
            f = format(type, a);
            process.stdout.write(f);
            break;
        }

        // 出力先のファイル名.
        var outName = outLogDir + n + ".log";

        // ファイルサイズ制限に達した場合.
        // または、作成ファイル日付の日付と現在日付が変わった場合.
        fs.stat(outName, function(err, value) {
          var on = outName; outName = null;
          var ff = f; f = null;
          if(!err &&
            ((s > 0 && value.size + ff.length > s) || _toDate(new Date(value.ctime)) != _toDate(new Date()))) {
            while(true) {
              var mvName = (value.size + ff.length > s) ?
                on + "." + dateString() + "." + Date.now() + ".log":
                on + "." + dateString();
              try {
                // リネーム.
                fs.renameSync(on, mvName);
                
                // 新しいファイルに、ログ出力.
                fs.appendFile(on, ff, "utf-8",function(){

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
          } else {
            // リネーム対象でない場合のログ出力.
            fs.appendFile(on, ff, "utf-8",function(){});
          }
        });
      });
    }
  }

  // jsonからlogger設定をロード.
  o.load = function(json) {
    var v = null;
    var ret = [];
    o.setting(json.level, json.maxFileSize, json.logDir);
    for(var k in json) {
      if(k == "level" || k == "maxFileSize" || k == "logDir") {
        continue;
      }
      v = json[k];
      if(typeof(v) == "object") {
        ret.push(o.create(k, v.level, v.maxFileSize));
      }
    }
    return ret;
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
      isTraceEnabled: function() {
        return _outLogLevel <= 0;
      },
      trace: function() {
        outLog(_name, _outLogLevel, _maxFileSize, 0, arguments);
        return this;
      },
      isDebugEnabled: function() {
        return _outLogLevel <= 1 ;
      },
      debug: function() {
        outLog(_name, _outLogLevel, _maxFileSize, 1, arguments);
        return this;
      },
      isInfoEnabled: function() {
        return _outLogLevel <= 2 ;
      },
      info: function() {
        outLog(_name, _outLogLevel, _maxFileSize, 2, arguments);
        return this;
      },
      isWarnEnabled: function() {
        return _outLogLevel <= 3 ;
      },
      warn: function() {
        outLog(_name, _outLogLevel, _maxFileSize, 3, arguments);
        return this;
      },
      isErrorEnabled: function() {
        return _outLogLevel <= 4 ;
      },
      error: function() {
        outLog(_name, _outLogLevel, _maxFileSize, 4, arguments);
        return this;
      },
      isFatalEnabled: function() {
        return _outLogLevel <= 5 ;
      },
      fatal: function() {
        outLog(_name, _outLogLevel, _maxFileSize, 5, arguments);
        return this;
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