// プロセス間同期.
// .syncフォルダ以下にロックフォルダを作成して、ロック、アンロックを行う.
// また、現在ロックが行われているプロセスIDと、プロセスID内での連続ロックに対応するために
// ロックカウントで対応.
//
// ロックカウントは以下のような場合に有効となる.
// psync.lock("hoge", 5000, function(success) { // start lock count = 1
//   psync.lock("hoge", 5000, function(success) { // start lock count = 2
//     psync.unlock("hoge"); // unlock(lock count = 1)
//   });
//   psync.unlock("hoge"); // unlock(lock count = 0)
// });
//

// cbox/index.jsで計測した、nanoTimeをセット.
module.exports = function (systemNanoTime) {
  'use strict';
  var nums = require("./nums");
  var file = require("./file");
  var o = {};

  // 基本フォルダ.
  var _PROCESS_SYNC_BASE_FOLDER = "./.sync/";

  // 読み込みロック名.
  var _READ_LOCK_NAME = ".read";

  // ロックカウントヘッダ.
  var _LOCK_COUNT_HEAD = "@";
  
  // 同期リトライ時間(50ミリ秒).
  var _RETRY_SYNC_TIME = 50;

  // 基本ロックタイムアウト(5秒).
  var _LOCK_TIMEOUT = 5000;

  // 基本フォルダが存在しない場合は作成.
  if(!file.isDir(_PROCESS_SYNC_BASE_FOLDER)) {
    file.mkdir(_PROCESS_SYNC_BASE_FOLDER);
  }

  // 前回のゴミデータをクリーン処理.
  var _init = function() {
    var n = null;
    var name = null;
    var j = null;
    var lenJ = null;
    var head = "" + systemNanoTime;
    var list = file.list(_PROCESS_SYNC_BASE_FOLDER);
    if(list) {
      var len = list.length;
      for(var i = 0; i < len; i ++) {
        if(list[i].indexOf(head) != 0) {
          var name = _PROCESS_SYNC_BASE_FOLDER + list[i] + "/";
          var n = file.list(name);
          // 中のデータも全削除.
          if(n && n.length > 0) {
            lenJ = n.length;
            for(j = 0; j < lenJ; j ++) {
              file.removeDir(name + n[j]);
            }
          }
          // 対象フォルダを削除.
          file.removeDir(name);
        }
      }
    }
  }

  // 同期名を取得.
  var _baseLockName = function(name, readFlg) {
    if (readFlg == true) {
      return _PROCESS_SYNC_BASE_FOLDER + systemNanoTime + _READ_LOCK_NAME + "_" + name
    }
    return _PROCESS_SYNC_BASE_FOLDER + systemNanoTime + "_" + name
  }

  // ロックカウントを取得.
  var _getLockCount = function(name) {
    var n = null;
    var list = file.list(name);
    if(list) {
      var len = list.length;
      for(var i = 0; i < len; i ++) {
        n = list[i];
        if(n.indexOf(_LOCK_COUNT_HEAD) == 0) {
          return n.substring(1)|0;
        }
      }
    }
    return 1; // ロックカウントが無い.
  }

  // ロックカウントをUp/Down.
  var _lockCount = function(name, nowCount, up) {
    var count = null;
    var ret = null;
    var lockCountName = name + "/" + _LOCK_COUNT_HEAD;
    while(true) {
      // 現在のカウントが一致する場合のみ、更新する.
      if(nowCount == (count = _getLockCount(name))) {
        ret = (up ? nowCount + 1 : nowCount - 1);
        file.rename(
          lockCountName + nowCount,
          lockCountName + ret);
        return ret;
      }
      nowCount = count;
    }
  }

  // 同期処理.
  var _lock = function(name, timeout, call, timeoutCall) {

    // タイムアウトコールが未設定の場合は、callで代用.
    if(!timeoutCall) {
      timeoutCall = call;
    }

    // ロック名を生成.
    var lockName = _baseLockName(name);

    // 読み込み用読み込みロック名.
    var readLockName = _baseLockName(name, true);

    // ロックされている場合に[true].
    // ファイルが存在しない場合は[false]が返却される.
    var lockFlg = file.isDir(lockName);

    // 読み込み用ロックされている場合に[true].
    // ファイルが存在しない場合は[false]が返却される.
    var readLockFlg = file.isDir(readLockName);

    // ロックファイルが存在する場合は、待機処理.
    // または、読み込み用ロックが行われている場合.
    if(lockFlg || readLockFlg) {

      // リトライ処理.
      setTimeout(function() {
        var t = timeout;
        var n = name;
        var c = call;
        var tc = timeoutCall;
        name = null; call = null;timeout = null;timeoutCall = null;

        // ロックタイムアウト.
        if(t > 0 && Date.now() > t) {
          // タイムアウトコール.
          tc(false);
        } else {
          // ロック待機.
          _lock(n, t, c, tc);
        }
      }, _RETRY_SYNC_TIME);

    // 同期が行われていない場合.
    // ロックが解除されている場合.
    // ロック処理を行って、処理実行.
    } else {

      // ロック名.
      file.mkdir(lockName);

      // 処理実行.
      setImmediate(function() {
        var c = call;
        call = null;
        c(true);
      });

    }
  }

  // アンロック.
  var _unLock = function(name) {

    // ロック名.
    var lockName = _baseLockName(name);

    // ロック名 が存在する場合は、同期解除を試みる.
    if(file.isDir(lockName)) {

      // ロック名を削除.
      file.removeDir(lockName);
      return true;
    }
    return false;
  }

  // 読み込み専用ロック.
  var _readLock = function(name, timeout, call, timeoutCall) {

    // タイムアウトコールが未設定の場合は、callで代用.
    if(!timeoutCall) {
      timeoutCall = call;
    }

    // ロック名を生成.
    var lockName = _baseLockName(name);

    // 読み込み用読み込みロック名.
    var readLockName = _baseLockName(name, true);

    // 読み込み用ロックカウント名.
    var readLockCountName = readLockName + "/" + _LOCK_COUNT_HEAD;

    // ロックされている場合に[true].
    // ファイルが存在しない場合は[false]が返却される.
    var lockFlg = file.isDir(lockName);

    // 読み込み用ロックされている場合に[true].
    // ファイルが存在しない場合は[false]が返却される.
    var readLockFlg = file.isDir(readLockName);

    // ロックファイルが存在する場合は、待機処理.
    if(lockFlg) {

      // リトライ処理.
      setTimeout(function() {
        var t = timeout;
        var n = name;
        var c = call;
        var tc = timeoutCall;
        name = null; call = null;timeout = null;timeoutCall = null;

        // ロックタイムアウト.
        if(t > 0 && Date.now() > t) {
          // タイムアウトコール.
          tc(false);
        } else {
          // 読み込み用ロック待機.
          _readLock(n, t, c, tc);
        }
      }, _RETRY_SYNC_TIME);

    // このプロセスで読み込み用ロック中の場合.
    // 読み込み用ロックカウントをアップして、処理実行.
    } else if(readLockFlg) {

      // ロックカウントをUP.
      _lockCount(readLockName, _getLockCount(readLockName), true);
      name = null; 

      // 処理実行.
      setImmediate(function() {
        var c = call;
        call = null;
        c(true);
      });

    // ロックが行われていない状態.
    // ロックが解除されている場合.
    // 読み込み用ロック処理を行って、処理実行.
    } else {

      // 読み込み用ロック名.
      file.mkdir(readLockName);

      // 読み込み用ロックカウントを設定.
      file.mkdir(readLockCountName + "1");
      name = null; 

      // 処理実行.
      setImmediate(function() {
        var c = call;
        call = null;
        c(true);
      });

    }
  }

  // 読み込み用同期解除.
  var _readUnLock = function(name) {

    // 読み込み用読み込みロック名.
    var readLockName = _baseLockName(name, true);

    // 読み込み用ロックカウント名.
    var readLockCountName = readLockName + "/" + _LOCK_COUNT_HEAD;

    // 読み込み用ロック名が存在する場合.
    if(file.isDir(readLockName)) {
      
      // 読み込み用ロックカウントを取得してカウント処理の場合は、ロック解除する.
      var nowCount = _getLockCount(readLockName);

      // ロックカウントをダウン.
      nowCount = _lockCount(readLockName, nowCount, false);

      // 読み込み用ロック解除.
      if(nowCount <= 0) {

        // 読み込み用ロックカウントを削除.
        file.removeDir(readLockCountName + nowCount);

        // 読み込み用ロック名を削除.
        file.delete(readLockName);
        return true;
      }
    }
    return false;
  }

  // 非同期用: 読み込み・書き込みロック保護.
  var _asyncRWLock = function(writeFlag, name, timeout, call, errorCall) {
    var startLock = null;
    var releaseLock = null;
    if(writeFlag) {
      startLock = _lock;
      releaseLock = _unLock;
    } else {
      startLock = _readLock;
      releaseLock = _readUnLock;
    }
    // ロック開始.
    startLock(name, timeout,
      // 正常 or エラー.
      function(result) {
        var release = releaseLock; releaseLock = null;
        var c = call; call = null;

        // ロック解除のメソッドは第一引数に設定されます.
        // 処理結果 [true=success] は第二引数に指定されます.
        c(function() {
          var r = release; release = null;
          // アンロック処理を実行.
          r(name);
        }, result);
      },
      // エラー.
      function(result) {
        var release = releaseLock; releaseLock = null;
        var c = call; call = null;
        var e = errorCall; errorCall = null;
        if(typeof(e) == "function") {
          // ロック解除のメソッドは第一引数に設定されます.
          // 処理結果 [false=error] は第二引数に指定されます.
          e(function() {
            var r = release; release = null;
            // アンロック処理を実行.
            r(name);
          }, result);
        } else {

          // ロック解除のメソッドは第一引数に設定されます.
          // 処理結果 [false=error] は第二引数に指定されます.
          c(function() {
            var r = release; release = null;
            // アンロック処理を実行.
            r(name);
          }, result);
        }
      });
  }

  // ユーザ設定ロックタイムアウト.
  var _userLockTimeout = _LOCK_TIMEOUT;

  // ロックタイムアウトを整形.
  var _checkLockTimeout = function(time, userLockTimeoutFlag) {
    if(!nums.isNumeric(time)) {
      time = userLockTimeoutFlag ? _userLockTimeout: _LOCK_TIMEOUT;
    } else {
      time = time | 0;
      if(time <= 0) {
        time = time;
      }
    }
    return time;
  }

  // ユーザデフォルトロックタイムアウトをセット.
  var _setUserLockTimeout = function(time) {
    _userLockTimeout = _checkLockTimeout(time, false);
  }

  // 強制ロック解除.
  var _forcedLock = function(name) {
    // ロック名を生成.
    var lockName = _baseLockName(name);

    // 読み込み用読み込みロック名.
    var readLockName = _baseLockName(name, true);

    // 書き込み・読み込み用のロック情報を全削除します.
    var resLock = file.delete(lockName);
    var resReadLock = file.delete(readLockName);
    return {resLock: resLock, resReadLock: resReadLock};
  }

  // 初期処理.
  o.init = function() {
    _init();
  }

  // [非同期用] 同期処理.
  o.lock = function(name, timeout, call, timeoutCall) {
    _lock(name, _checkLockTimeout(timeout, true) + Date.now(), call, timeoutCall);
  }

  // [非同期用] 同期解除.
  o.unLock = function(name) {
    return _unLock(name);
  }

  // [非同期用] 読み込み用ロック.
  o.readLock = function(name, timeout, call, timeoutCall) {
    _readLock(name, _checkLockTimeout(timeout, true) + Date.now(), call, timeoutCall);
  }
  
  // [非同期用] 読み込み用同期解除.
  o.readUnLock = function(name) {
    return _readUnLock(name);
  }

  // 非同期用ロック.
  o.async = {};

  // [async] 同期処理.
  o.async.lock = function(name, timeout, call, timeoutCall) {
    _asyncRWLock(true, name, _checkLockTimeout(timeout, true) + Date.now(), call, timeoutCall);
  }

  // [async] 読み込み用ロック.
  o.async.readLock = function(name, timeout, call, timeoutCall) {
    _asyncRWLock(false, name, _checkLockTimeout(timeout, true) + Date.now(), call, timeoutCall);
  }

  // ロックされているかチェック.
  o.isLock = function(name) {
    // ロック処理か、読み込み中ロック処理がある場合.
    return file.isDir(_baseLockName(name)) ||
      file.isDir(_baseLockName(name, true))
  }

  // 強制ロック解除.
  o.forcedLock = function(name) {
    return _forcedLock(name);
  }

  // ユーザロックデフォルトタイムアウト値を設定.
  o.setUserLockTimeout = function(time) {
    _setUserLockTimeout(time);
  }

  // ユーザロックデフォルトタイムアウト値を取得.
  o.getUserLockTimeout = function() {
    return _userLockTimeout;
  }

  return o;
}