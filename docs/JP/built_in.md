# ライブラリ組み込みについて

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

English documents [here](https://github.com/maachang/msful/blob/master/docs/ENG/build_in.md)

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

_

_

msful では `msful project` で、プロジェクト作成をすると、作成される `startup.js` ので、ライブラリなどの組み込みは ここで行います。

## startup.js

この内容を編集して、初期化処理やライブラリの組み込みを行います。

startup.js
```javascript
// Write a script that will be executed at msful startup.
//
//

// _g : Global variable.
// conf : Configuration definition is set.
// envName: The execution environment name is set.
// consoleFlag: "true" when running in console mode.
// serverId: The server ID is set.
'use strict';

// Set the initial condition to `users`.
const users = {};



return users;
```

`counst users` に対して、組み込みたいライブラリを定義することで、そのライブラリが msful で利用可能となります。

まずは、例として `mongodb` を組み込む場合の実装方法について、説明します.

_

_

### mongodbクライアントをインストール

これがインストールされていない場合、まずは、コマンド実行で mongodb クライアントをインストールします。

```cmd

$ npm install mongodb

```

_

_

### mongodbを組み込む

先程インストールした mongodb クライアントを初期化して、usersオブジェクトに設定して、組み込みます.

./conf/mongodb.json

```json
{
  "url": "mongodb://127.0.0.1:27017/myDB"
}
```

./startup.js
```javascript
// Write a script that will be executed at msful startup.
//
//

// _g : Global variable.
// conf : Configuration definition is set.
// envName: The execution environment name is set.
// consoleFlag: "true" when running in console mode.
// serverId: The server ID is set.
'use strict';

// Set the initial condition to `users`.
const users = {};

// mongodb.
(function() {
  try {
    const mongoClient = require('mongodb').MongoClient
    var db = null;

    // mongodb connection.
    mongoClient.connect(conf.mongodb.url, function(err, mongodb) {
      if(err) {
        console.error("connect error mongodb", err);
        mongodb.close();
        process.exit(1);
      } else {
        db = mongodb;
      }
    })

    // Get mongodb's collection.
    var mongo = function( name ) {
      return db.collection( name );
    }

    // Register mongodb as users.
    users.mongo = mongo;
  } catch(e) {
    console.error("error mongodb", e);
    process.exit(1)
  }
})();

return users;

```

_

_

### mongodbを利用する

実際に webApiで、mongodbを利用します.

_

_

#### データ保存.

./api/userInfo/save.js
```javascript

// validate.
validate("POST"
  ,"name",  "string", "req"
  ,"age",   "number", ""
  ,"sex",   "number", "default 3"
);

// Load mongodb created in "startup.js".
const mongo = users.mongo;
const COL = "userInfo";

// Save parameters to mongodb.
return mongo(COL).insertOne(params).then(function(r) {
  // Return processing result.
  rtx.send(r);
});

```

_

_

#### データ取得.

./api/userInfo/find.js
```javascript
const ObjectID = require('mongodb').ObjectID;

// validate.
validate("GET"
  ,"id",  "number", "req"
);

// Load mongodb created in "startup.js".
const mongo = users.mongo;
const COL = "userInfo";

// Read data from mongodb.
mongo(COL).findOne({
    _id: new ObjectID(params.id)
  }, {}, function(err, r){
  if(err) {
    // Return exception.
    rtx.exception(err);
  } else {
    // Return processing result.
    rtx.send(r);
  }
});

```

_

_

#### データ削除

./api/userInfo/remove.js
```javascript
const ObjectID = require('mongodb').ObjectID;

// validate.
validate("GET"
  ,"id",  "number", "req"
);

// Load mongodb created in "startup.js".
const mongo = users.mongo;
const COL = "userInfo";

// Delete data from mongodb.
mongo(COL).findOneAndDelete({
    _id: new ObjectID(params.id)
  }, {}, function(err, r){
  if(err) {
    // Return exception.
    rtx.exception(err);
  } else {
    // Return processing result.
    rtx.send(r);
  }
});

```

こんな感じで、usersに初期化したライブラリなどを、設定することが出来ます.

_

_

# logger組み込み

msful では、簡易的なロガーが組み込まれています.

開発や、msful自体のシステムログ程度ならば、これで問題ないのですが、簡易的なロガーではなく `log4js` など、デファククタなロガーを使いたい場合、ここにある方法で、変更が可能です.

また `system` と言う名前で、msfulのログ出力が登録されているので、この名前を上書きすることで、msfulのシステムログも変更可能です.

_

_

## 組み込み方法.

log4jsをインストール.

```cmd
$ npm install log4js
```

_

_

### log4jsの定義を記載.

./conf/log4js.json

```json
{
  "appenders" : {
    "system" : {"type": "file", "filename": "./log/system.log"}
  },
  "categories" : {
    "default" : {"appenders" : ["system"], "level" : "debug"},
  }
}
```

### startup.jsに組み込む.

startup.js
```javascript
// Write a script that will be executed at msful startup.
//
//

// _g : Global variable.
// conf : Configuration definition is set.
// envName: The execution environment name is set.
// consoleFlag: "true" when running in console mode.
// serverId: The server ID is set.
'use strict';

// Get log4js logger.
const log4js = require('log4js')

// Configure log4js settings.
log4js.configure(conf.log4js);

// Get msful logger.
var logger = msfulLogger();

// Add log4js "system" logger.
logger.setup("system", log4js.getLogger("system"));

// Set the initial condition to `users`.
const users = {};



return users;
```

## loggerの使い方.

./api/index.js

```javascript

// Load log4js "system" logger.
const log = logger.get("system");

// Output log.
log.info("access /api/index.js");

// http response return.
Rtx.send({"result": "success"})
```

これで、msfulの `system` ロガーが log4js に置き換わりました.
