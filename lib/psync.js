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
  var file = require("./file");
  var o = {};

  // 基本フォルダ.
  var _PROCESS_SYNC_BASE_FOLDER = "./.sync/";

  // ロックカウントヘッダ.
  var _LOCK_COUNT_HEAD = "@";
  
  // 同期リトライ時間.
  var _RETRY_SYNC_TIME = 5;

  // 基本フォルダが存在しない場合は作成.
  if(!file.isDir(_PROCESS_SYNC_BASE_FOLDER)) {
    file.mkdir(_PROCESS_SYNC_BASE_FOLDER);
  }

  // 前回のゴミデータをクリーン処理.
  (function() {
    var n = null;
    var name = null;
    var j = null;
    var lenJ = null;
    var head = "" + systemNanoTime;
    var list = file.list(_PROCESS_SYNC_BASE_FOLDER);
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
  })();

  // 同期名を取得.
  var _baseLockName = function(name) {
    return _PROCESS_SYNC_BASE_FOLDER + systemNanoTime + "_" + name
  }

  // ロックカウントを取得.
  var _getLockCount = function(name) {
    var n = null;
    var list = file.list(name);
    var len = list.length;
    for(var i = 0; i < len; i ++) {
      n = list[i];
      if(n.indexOf(_LOCK_COUNT_HEAD) == 0) {
        return n.substring(1)|0;
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

    // タイムアウト値.
    timeout = timeout|0;

    // タイムアウトコールが未設定の場合は、callで代用.
    if(!timeoutCall) {
      timeoutCall = call;
    }

    // ロック名を生成.
    var lockName = _baseLockName(name);

    // ロックプロセスID.
    var lockProcessName = lockName + "/" + process.pid;

    // ロックカウント名.
    var lockCountName = lockName + "/" + _LOCK_COUNT_HEAD;

    // ロックされている場合に[true].
    // ファイルが存在しない場合は[false]が返却される.
    var lockFlg = file.isDir(lockName);

    // ロックしているプロセスIDが今回のプロセスと一致する場合に[true].
    // ファイルが存在しない場合は[false]が返却される.
    var pidFlg = file.isDir(lockProcessName);

    // ロックファイルが存在し、プロセスIDが一致しない場合は、待機処理.
    if(lockFlg && !pidFlg) {

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
          _lock(n, c, tc);
        }
      }, _RETRY_SYNC_TIME);

    // このプロセスでロックしている場合.
    // ロックカウントをアップして、処理実行.
    } else if(lockFlg && pidFlg) {

      // ロックカウントをUP.
      var nowCount = _getLockCount(lockName);
      _lockCount(lockName, nowCount, true);
      name = null; 

      // 処理実行.
      setImmediate(function() {
        var c = call;
        call = null;
        c(true);
      });

    // 同期が行われていない場合.
    // ロックが解除されている場合.
    // ロック処理を行って、処理実行.
    } else {

      // ロック名.
      file.mkdir(lockName);

      // 実行プロセスID.
      file.mkdir(lockProcessName);

      // ロックカウント.
      file.mkdir(lockCountName + "1");
      name = null; 

      // 処理実行.
      setImmediate(function() {
        var c = call;
        call = null;
        c(true);
      });

    }
  }

  // 同期処理.
  o.lock = function(name, timeout, call, timeoutCall) {
    timeout = timeout|0;
    if(timeout > 0) {
      timeout += Date.now();
    }
    _lock(name, timeout, call, timeoutCall);
  }

  // 同期解除.
  o.unlock = function(name) {

    // ロック名.
    var lockName = _baseLockName(name);

    // ロックプロセスID.
    var lockProcessName = lockName + "/" + process.pid;

    // ロックカウント名.
    var lockCountName = lockName + "/" + _LOCK_COUNT_HEAD;

    // ロック名 + processIdのフォルダが存在する場合は、同期解除を試みる.
    if(file.isDir(lockProcessName)) {
      
      // ロックカウントを取得してカウント処理の場合は、ロック解除する.
      var nowCount = _getLockCount(lockName);
      nowCount = _lockCount(lockName, nowCount, false);

      // ロック解除.
      if(nowCount <= 0) {
        // ロックプロセスIDを削除.
        file.removeDir(lockProcessName);

        // ロックカウントを削除.
        file.removeDir(lockCountName + nowCount);

        // ロック名を削除.
        file.removeDir(lockName);
        return true;
      }
    }
    return false;
  }

  // ロックされているかチェック.
  o.isLock = function(name) {
    return file.isDir(_baseLockName(name));
  }

  return o;
}