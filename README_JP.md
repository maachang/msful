# msfulはマイクロサービス用のWeb APIサーバーです。

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

English documents [here](https://github.com/maachang/msful/blob/master/README.md)

msdulは非常に簡単で非常にシンプルなWebアプリケーションサーバーであり、できるだけ早くアイデアを作成することを目指しています。

msfulはRESTfulで既存のURLマッピングを実行する必要はなく、ディレクトリベースのURLアクセス方式を採用しているため、より直感的な開発が可能です。

簡単で薄いフレームワークであるmsfulなので、nodejsでの開発経験があったり、webベースでのJavascriptプログラムを扱える人ならば、多くの学習コストを必要とせずにすぐに開発することができます。

私ことmsfulの開発者は、あなたに対してより良い開発環境を提供できることを願っています。

# msfulの導入方法

- インストール

※ nodejsがインストールされていって npm が利用できることが前提です。

```
$ npm install -g msful
```

- プロジェクトを作成する.

ここでは myProject と言う新しいプロジェクトを作成しています。

```
$ msful project myProject
$ cd myProject
```

- コンテンツファイルの作成

まずはじめに、静的なHTMLファイルを作成します。HTMLなどの静的なファイルは、htmlフォルダ配下に作成します。

```
 $ vi html/index.html
```

```html
<html>
  <head></head>
  <body>
    hoge!!
  </body>
</html>
```

- webapiファイルの作成

次に動的なWebAPIを作成します。WebAPIのファイルは、apiフォルダ配下に作成します。

```
 $ vi api/index.js
```

```javascript
return {hello: "world"};
```

- msful起動

msfulをサーバ実行します。

```
 $ msful
```

実行すると、以下のような内容が表示されます。
このような表示がされた場合、正常に起動しています。

```javascript
## listen: 3333 contentCache:true pid:3696
```

# msfulのサーバ実行結果を確認します。


先ほど作成した静的なHTMLファイル見てみます。

ブラウザを起動してURLアドレス入力欄に `http://localhost:3333/` を入れます。

すると、以下のような表示内容がブラウザに表示されます。

```
 hoge!!
```

次に、WebAPIの結果を見てみます。

ブラウザを起動してURLアドレス入力欄に `http://localhost:3333/api/` を入れます。

すると、以下のような表示内容がブラウザに表示されます。

```
 {"hello": "world"}
```

非常に簡単ではありますが、msfulはこんな感じで簡単に直感的に、利用することが出来ます。


# msfulサーバ起動オプション.

- ポート番号を変更して起動します.

```
 msful -p 8080
```

or 

```
 msful --port 8080
```

```javascript
## listen: 8080 contentCache:true pid:3696
```

- 静的なコンテンツに対して、キャッシュを行う／行わないように設定します。

このオプションはたとえば、システムの開発中にHTMLやjsファイルなどの静的コンテンツファイルがキャッシュされることで、更新内容が反映されてないなどの問題がありますが、そのような場合に利用するとよいでしょう。

```
 msful -c false
```

or 

```
 msful --cache false
```

```javascript
## listen: 3333 contentCache:false pid:3696
```

# WebAPI固有の機能

- WebApi上では、以下の機能が利用できます。

```
> params：   HTTPパラメータ,POSTやGETQueryパラメータなどの情報。

> request：  HTTPリクエストオブジェクト(node標準).

> response： HTTPレスポンスオブジェクト(node標準).

> headers：  HTTPレスポンス用HTTPヘッダ群(連想配列)

> httpError: function(status, message) => HTTPエラーで返却させたい場合に利用するメソッド.

> redirect: function(url, status) => リダイレクトする場合に利用するメソッド.

> status: function(state) => HTTPステータスの読み込み、書き込みメソッド.
```

## 使用例

- 実装

```
 $ vi api/index.js
```

```javascript
value =  " hoge: [" + params.hoge + "]"
value += " method: [" + request.method + "]"
value += " url: [" + request.url + "]"

return {value: value}
```

- ブラウザで閲覧

http://localhost:3333/api/?hoge=abc

-  処理結果

```
 {value: "hoge: hoge: [abc] method: [GET] url: [/api/?hoge=abc]"}
```

## httpErrorメソッドの使用例.

- 実装

```
 $ vi api/index.js
```

```javascript
httpError(500, "test Error");

・・・・
```

- ブラウザで閲覧

http://localhost:3333/api/index

-  処理結果

```
{error: 500, message: "test Error"}
```


## バイナリ用POST送信を行うには

バイナリ用のPOSTデータをmsfulで利用するには `Content-Type` に `application/octet-stream` をセットして、POST送信を行う必要があります。

- 使用例

Ajaxで `Content-Type` に `application/octet-stream` を設定してPOST通信を行います。

```javascript
fetch('http://localhost:3333/api/binaryUpload', {
  method: 'POST',
  body: binaryData,
  headers: {
    'Content-Type': 'application/octet-stream'
  }
}).
......
```

- 受信

受信結果はそのまま `params` に設定されます

## フィルタ機能

フォルダを配置したフォルダにアクセスされた場合に起動します。

主な使い方は、共通のチェック処理、たとえばアクセス認証などの機能に利用することを想定しています。

フィルタの作成方法は、対象フォルダ配下に `@filter.js` と言うファイルを作成します。

フィルタ機能として満たされた場合、つまり本来の呼び出し処理を行ってよい場合は `return true` を返却します。

フィルタ機能として満たされない場合、本来の呼び出し処理を行いたくない場合は `return false` を返却するか、httpErrorメソッドやredirectメソッドなどを利用するなど。


# msfulのコマンド情報.

## projectコマンド

- 新しいプロジェクトを作成する

以下のコマンドを実行します.

```
 $ mkdir example
 $ cd example
 $ msful project example
 msful(micro service RESTFul API Server) v0.0.40
 Copyright(c) 2018 maachang.
 
 new project!!
  [html]directory.
    It stores static files (HTML, JS, CSS, Images) here.
  [api]directory
    Here, we store RESTFul API programs implemented by JS.
  [lib]directory
    This is a folder for storing JS libraries.
  [conf]directory
    This is a folder for storing configuration information in JSON format.
```

もしくはこのコマンド.

```
 $ msful project example
 msful(micro service RESTFul API Server) v0.0.40
 Copyright(c) 2018 maachang.
 
 new example project.
  [html]directory.
    It stores static files (HTML, JS, CSS, Images) here.
  [api]directory    Here, we store RESTFul API programs implemented by JS.
  [lib]directory.
    This is a folder for storing JS libraries.
  [conf]directory.
    This is a folder for storing configuration information in JSON format.
  
  $ cd example
```

- 作成結果.

```
 $ ls -la
drwxr-xr-x 1 root 197121 0 Apr 14 23:29 .
drwxr-xr-x 1 root 197121 0 Apr  8 17:27 ..
drwxr-xr-x 1 root 197121 0 Apr  5 18:38 api
drwxr-xr-x 1 root 197121 0 Apr 14 23:14 conf
drwxr-xr-x 1 root 197121 0 Apr  3 01:17 html
drwxr-xr-x 1 root 197121 0 Apr 14 23:29 lib
drwxr-xr-x 1 root 197121 0 Apr 14 23:29 package.json
```

## helpコマンド

- msfulのコマンド説明が見れます

```
 $ msful help
```

```
msful [cmd]
 [cmd]
   project: Create a template for the new project.
   project [name]: Expand the project structure under the project name folder.
   help:    Display help information.
   console: At the console, run JS on line.
   console [file]: Run the specified file on the console.
   -p [--port] number Set the server bind port number.
   -c [--cache] [true/false] Configure the content cache.
```

## console機能

msfulのプロジェクト環境上で、対話モードまたはファイル指定でファイルを実行します。

- 対話モードで実行

```
msful console
```

何か、簡単な機能を試す場合に最適です。


- 指定されたJSファイルを実行

```
msful console [js-filename]
```

用途としては、バッチ実行などで利用するとよいかと思います。

# configファイル機能

`conf`フォルダの下にJSON形式のファイルを作成すると、プログラム内でそのJSON形式の定義内容を利用することが出来ます。

たとえば、 `/conf/hogehoge.conf`というファイルを作成すると、実行プログラム上では `config.hogehoge` と言うJSON形式の変数で利用することが出来ます。

- 利用例

`./conf/dbInfo.conf`
```javascript
{
    name: "testDB",
    host: "localhost",
    port: 5432
}
```

- conf情報を利用したWebAPI実装

`./api/dbInfo.js`
```javascript
return {
  "dbInfo-name": config.dbInfo.name,
  "dbInfo-host": config.dbInfo.host,
  "dbInfo-port": config.dbInfo.port
};
```

ブラウザを起動してURLアドレス入力欄に `http://localhost:3333/api/dbInfo` を入れます。

- 処理結果.

```
{"dbInfo-name": "testDB", "dbInfo-host": "localhost", "dbInfo-port": "5432"}
```

# 基本モジュール.

WebAPIと、マイクロサービス開発に必要なモジュールについて説明します.

## jwtモジュール.

JWT `json-web-token` を使ってログインの認証などで利用します。

### jwt.create(key, payload)

JWTを生成します.

- key

トークンを作成するためのキーを設定します。

- payload

ペイロード文字列を設定します。

- 使用例

```javascript
jwt.create("hoge", "{a:100}");
```

- 処理結果

```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0"
```

### jwt.payload(jwt)

jwt情報からペイロード情報を取得します。

- jwt

JWT情報を設定します.

- 使用例

```javascript
jwt.payload(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

- 処理結果

```
{a:100}
```

### jwt.validate(key, jwt)

指定されたJWT情報が指定されたキーで生成された情報であり、ペイロード情報などが変更されていないことを確認します。

- key

トークンを作成するためのキーを設定します。

- jwt

jwt情報を設定します。

- 使用例(成功)

```javascript
jwt.validate("hoge",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

- 処理結果

```
true
```

- 使用例(失敗)

```javascript
jwt.validate("moge",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

- 処理結果

```
false
```

# closeable

処理終了後に、確実にクローズ処理を実行したい処理を行う場合に利用します。

※ただし、コンソールからは使用できません。

## closeable.register(obj)

closeableにクローズ処理を行う処理を登録します.

- obj

ターゲットはオブジェクト型であり、内部にcloseメソッドを含める必要があります。

- 使用例

```javascript
closeable.register({close:function(){ console.log("hoge"); }});
```

上記の内容のAPIを実行すると、msfulを起動しているターミナルに次のようなメッセージが表示されます。

```
hoge
```

## closeable.close()

登録メソッドによって登録されたすべてのコンテンツを閉じます。
ただし、このプロセスは通常は呼び出す必要はなく、apiの実行直後に自動的に呼び出されます。

# validate

POSTおよびGETパラメータの検証処理を実行します。

ここで言うパラメータとは `params` の内容を指します.

また、default 設定で存在しない場合のデフォルト値を設定したり、rename 設定でパラメータ名を変更することが可能です.

## validation

- 引数説明

```
validate(method,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck
)
```

**method**:

アクセス可能なHttpメソッドを設定します。 省略すると、すべてのHttpメソッドが許可されます。

**paramName**:

ターゲットパラメータ名を設定します。

**dataType**:

ターゲットパラメータ名のデータ型を設定します。 設定できる項目は次のとおりです。

| タイプ名 | 説明 |
|:---------|:--------------------|
| string | 文字列に変換します |
| number | 整数に変換します |
| float | 浮動小数点に変換します |
| bool | BOOLEAN型に変換します |
| date | 日付オブジェクトに変換します |
| list | Arrayオブジェクトに変換します |
| object | オブジェクトに変換します |

`object` と `list` の型は、paramsの内容が同じ型のときに指定されます。

**executeAndCheck**:

`paramName` に対する状態を確認、変更するための条件設定です。

| 定義名 | 設定例 | 設定例説明 |
|:-----------|:--------|:--------------------|
| none | "none" | 何もしません |
| required | "required" | データが空の場合エラー |
| min num | "min 5" | ５より小さい(String.length < 5 or Number < 5)場合エラー |
| max num | "max 5" | ５より大きい(String.length > 5 or Number > 5)場合エラー |
| range min max | "range 5 12" | ５以上１２以下の場合エラー |
| regex | "regex 'hoge'" | `hoge` と言う文字が存在しない場合エラー |
| url | "url" | URL形式で無い場合エラー |
| email | "email" | email形式で無い場合エラー |
| date | "date" | `yyyy-MM-dd` 形式で無い場合エラー |
| time | "time" | `HH:mm` 形式で無い場合エラー |
| timestamp | "timestamp" | DateオブジェクトでNaNになる場合エラー |
| default | "default 0" | データが空の場合0をセットする |
| rename | "rename 'abc'" | パラメータ名を `abc` にリネームする |

この定義は `|`で連続して設定できます。

**＜例＞**
```
"min 5 | max 12 | url"
```

- validate設定例

/api/exampleValidate.js
```javascript
validate("POST",
    "name",          "string", "req",
    "age",           "number", "default 18",
    "lat",           "float",  "default 0.0",
    "comment",       "string", "max 128",
    "X-Test-Code",   "string", "req"
);

return {value: JSON.stringify(params)};
```

- Ajaxでアクセスするための実装内容.

```javascript
fetch('http://localhost:3333/api/exampleValidate', {
  method: 'POST',
  body: JSON.stringify(sendParams),
  headers: {
    'Content-Type': 'application/json; charset=utf-8;',
    'X-Test-Code': 'test'
  }
}).
......
```

- Ajaxでの送信データ内容(正常).

```javascript
var sendParams = {
  name: "maachang",
  age: 30,
  comment: "hogehoge",
}
```

- 処理結果

```
{"name": "maachang", "age": 30, "lat": 0.0, "comment": "hogehoge", "X-Test-Code": "test"}
```

- Ajaxでの送信データ内容（エラー）.

```javascript
var sendParams = {
  age: 30,
  comment: "hogehoge",
}
```

- 処理結果

```
{status: 400, message: "Contents of 'name' are mandatory"}
```

# entity

JSON形式のデータの書式設定を定義します。

利用想定としては、たとえばデータベースから多くの列を持つデータを取得したが、返却条件はそれほど多くない場合は自前で変換プログラムを実装したりするのは面倒であると言えます。
それに、JSでは型がないことから、受信側が数値で受け取ることを考慮しているプログラムを実装しているが、こちら側の返却では文字列なっていてエラーになるなど、これらを一々変換処理を入れたりするのも、面倒でメンテナンス的にも問題となるでしょう。

entityは、それらの面倒な問題を払拭するために利用します。

## entity.expose

JSONの書式を定義します。

データをJSON形式でフォーマットし、定義名を最初の引数として設定することを定義します。
2番目以降の引数については、 `parameter name`、` parameter type`、 `processing content`を定義します。

- 定義説明

```
entity.expose(name,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck
)
```

**name**:

 定義名を設定します.

**paramName**:

ターゲットパラメータ名を設定します。

**dataType**:

ターゲットパラメータ名のデータ型を設定します。 設定できる項目は次のとおりです。

| タイプ名 | 説明 |
|:---------|:--------------------|
| string | 文字列に変換します |
| number | 整数に変換します |
| float | 浮動小数点に変換します |
| bool | BOOLEAN型に変換します |
| date | 日付オブジェクトに変換します |
| list | Arrayオブジェクトに変換します |
| object | オブジェクトに変換します |
| $name | 別のentity.expose定義名を設定し、新しいインデントを作成します。 |
| { | オブジェクトのインデントを開始します。 |
| } | オブジェクトのインデントを終了します。 |

`object` と `list` の型は、paramsの内容が同じ型のときに指定されます。

`$name` タイプは、以下のように利用します.

**＜例＞**
```javascript
entity.expose("user",
  "name",  "string",  "",
  "age",   "number",  "",
);
entity.expose("users",
  "list",  "$user",   ""
);

var res = {
  list: [
    {name: "maachang", age:18},
    {name: "saito",    age:21}
  ]
};

return entity.make("users", res);
```

**＜結果＞**
```
{
  "list": [
    {"name": "maachang", "age": 18},
    {"name": "saito", "age": 21}
  ]
}
```

 `{`や `}` のタイプは、以下のように利用します.

**＜例＞**
```javascript
entity.expose("user",
  "name",  "string",    "",
  "age",   "number",    "",
  "details": "{",       "",
  "nickName": "string", "",
  "comment": "string",  "",
  "details": "}",       ""
);

{
  name: "maachang",
  age:18,
  nickName: "hoge",
  comment: "mogemoge"
}

return entity.make("user", res);
```

**＜結果＞**
```
{
  name: "maachang",
  age:18,
  details: {
    nickName: "hoge",
    comment: "mogemoge"
  }
}
```

**executeAndCheck**:

`paramName` に対する状態を確認、変更するための条件設定です。

| 定義名 | 設定例 | 設定例説明 |
|:-----------|:--------|:--------------------|
| none | "none" | 何もしません |
| required | "required" | データが空の場合エラー |
| min num | "min 5" | ５より小さい(String.length < 5 or Number < 5)場合エラー |
| max num | "max 5" | ５より大きい(String.length > 5 or Number > 5)場合エラー |
| range min max | "range 5 12" | ５以上１２以下の場合エラー |
| regex | "regex 'hoge'" | `hoge` と言う文字が存在しない場合エラー |
| url | "url" | URL形式で無い場合エラー |
| email | "email" | email形式で無い場合エラー |
| date | "date" | `yyyy-MM-dd` 形式で無い場合エラー |
| time | "time" | `HH:mm` 形式で無い場合エラー |
| timestamp | "timestamp" | DateオブジェクトでNaNになる場合エラー |
| default | "default 0" | データが空の場合0をセットする |
| rename | "rename 'abc'" | パラメータ名を `abc` にリネームする |

この定義は `|`で連続して設定できます。

**＜例＞**
```
"min 5 | max 12 | url"
```

## entity.make

`entity.expose` で作成した定義に対して、対象のJSONをチェック、変換します.

- name

`entity.expose` で作成した定義名を設定します.

- value

変換対象のJSON情報を設定します.

- 使用例

```javascript
entity.expose("user",
  "name",  "string",    "",
  "age",   "number",    "",
  "details": "{",       "",
  "nickName": "string", "",
  "comment": "string",  "",
  "details": "}",       ""
);

var res = {
  name: "maachang",
  age:18,
  nickName: "hoge",
  comment: "mogemoge"
}

return entity.make("user", res);
```

- 処理結果

```
{
  name: "maachang",
  age:18,
  details: {
    nickName: "hoge",
    comment: "mogemoge"
  }
}
```
