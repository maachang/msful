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

  // 空のメソッド.
  var blankFunc = function() {}

  // 日付情報を取得.
  var dateString = function(d) {
    var n = null;
    return (d.getYear() + 1900) + "-" +
      "00".substring((n = ""+(d.getMonth()+1)).length) + n + "-" +
      "00".substring((n = ""+d.getDate()).length) + n;
  }

  // ログフォーマットを生成.
  var format = function(t, args) {
    var n = null;
    var nx = "";
    var date = new Date();
    var ret = "[" +
      date.getFullYear() + "/" +
      "00".substring((n = ""+(date.getMonth()+1)).length) + n + "/" +
      "00".substring((n = ""+date.getDate()).length) + n + " " +
      "00".substring((n = ""+date.getHours()).length) + n + ":" +
      "00".substring((n = ""+date.getMinutes()).length) + n + ":" +
      "00".substring((n = ""+date.getSeconds()).length) + n + "." +
      "000".substring((n = ""+date.getMilliseconds()).length) + n +
      "] [" + t + "] ";
    var len = args.length;
    for(var i = 0; i < len; i ++) {
      if((n = args[i]) && n["stack"]) {
        ret += "\n" + n.stack;
        nx = "\n";
      } else {
        ret += nx + n + " ";
        nx = "";
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
        var s = fileSize;
        var n = name;
        var t = typeNo;
        var a = args;
        var f = null;
        switch(t) {
          case 0:
            process.stdout.write(f = format("TRACE", a));
            break;
          case 1:
            process.stdout.write(f = format("DEBUG", a));
            break;
          case 2:
            process.stdout.write(f = format("INFO", a));
            break;
          case 3:
            process.stdout.write(f = format("WARN", a));
            break;
          case 4:
            process.stdout.write(f = format("ERROR", a));
            break;
          case 5:
            process.stdout.write(f = format("FATAL", a));
            break;
        }

        // 出力先のファイル名.
        var outName = outLogDir + n + ".log";

        // ファイルサイズ制限に達した場合.
        // または、作成ファイル日付の日付と現在日付が変わった場合.
        fs.stat(outName, function(err, value) {
          var cnt = 0;
          var on = outName;
          var ff = f;
          var mvName = null;
          var now = new Date();
          var bf = blankFunc;
          var r =  null;

          // エラーでなく、
          // ファイルサイズの最大値が設定されていて、その最大値が肥える場合.
          // また、現在のログファイルの日付が、現在の日付と一致しない場合.
          if(!err &&
            (
              (s > 0 && value.size + ff.length > s) ||
              ((value.birthtime.getYear() & 31) | ((value.birthtime.getMonth() & 31) << 9) | ((value.birthtime.getDate() & 31) << 18))
                !=
              ((now.getYear() & 31) | ((now.getMonth() & 31) << 9) | ((now.getDate() & 31) << 18))
            )
          ) {
            while(true) {
              try {

                // 移動先のファイル名を作成.
                mvName = (s > 0 && value.size + ff.length > s) ?
                  on + "." + dateString(value.birthtime) + "." + cnt + "." + Date.now() :
                  on + "." + dateString(value.birthtime) + "." + cnt;

                // リネーム元が存在しない場合.
                // ファイルが存在しない場合は、例外が発生するので、そこで書き込み処理が行われる.
                if(!fs.statSync(on).isFile()) {
                  fs.appendFile(on, ff, "utf-8", bf);
                  return;
                }

                // リネーム先のファイルが既に存在する場合.
                // カウントをUPしたリネーム先ファイルを作成.
                try {
                  if(fs.statSync(mvName).isFile()) {
                    cnt ++;
                    continue;
                  }
                } catch(ex) {}

                // リネーム.
                fs.renameSync(on, mvName);

                // ログ出力.
                fs.appendFile(on, ff, "utf-8", bf);
               
                // 前のファイルをgz圧縮.
                fs.createReadStream(mvName).
                  pipe(zlib.createGzip()).
                  pipe(fs.createWriteStream(mvName + ".gz")).
                  on("close", function() {
                    try {
                      // 前のファイルを削除.
                      fs.unlinkSync(mvName);
                    } catch(e){}
                  });

                return;
              } catch(e) {
                // ログ出力.
                fs.appendFile(on, ff, "utf-8", bf);
                return;
              }
            }
          } else {
            // リネーム対象でない場合のログ出力.
            fs.appendFile(on, ff, "utf-8", bf);
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
      if(outLogDir.lastIndexOf("/") != outLogDir.length - 1) {
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
    var _name = name;

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