# msful基本機能説明

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

English documents [here](https://github.com/maachang/msful/blob/master/docs/ENG/next.md)

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

_

_

## http関連、request,response,paramsの使い方

```
 $ vi api/index.js
```

```javascript
value =  " hoge: [" + params.hoge + "]"
value += " method: [" + request.method + "]"
value += " url: [" + request.url + "]"

rtx.send({value: value})
```

### ブラウザで閲覧

http://localhost:3333/api/?hoge=abc

###  処理結果

```
 {value: "hoge: hoge: [abc] method: [GET] url: [/api/?hoge=abc]"}
```

### 受信

受信結果はそのまま `params` に設定されます.

_

_

## フィルタ機能

フォルダを配置したフォルダにアクセスされた場合に起動します。

主な使い方は、共通のチェック処理、たとえばアクセス認証などの機能に利用することを想定しています。

フィルタの作成方法は、対象フォルダ配下に `@filter.js` と言うファイルを作成します。

フィルタ機能として満たされた場合、つまり本来の呼び出し処理を行ってよい場合は `rtx.next` を呼び出します。

フィルタ機能として満たされない場合、本来の呼び出し処理を行いたくない場合は `new HttpError` でエラー処理を行うか、`rtx.redirect` メソッドなどを利用するなど。

_

_

# configファイル機能

`conf`フォルダの下にJSON形式のファイルを作成すると、プログラム内でそのJSON形式の定義内容を利用することが出来ます。

たとえば、 `/conf/hogehoge.conf`というファイルを作成すると、実行プログラム上では `config.hogehoge` と言うJSON形式の変数で利用することが出来ます。

### 利用例

`./conf/dbInfo.conf`
```javascript
{
    name: "testDB",
    host: "localhost",
    port: 5432
}
```

### conf情報を利用したWebAPI実装

`./api/dbInfo.js`
```javascript
// 例.
rtx.send({
  "dbInfo-name": config.dbInfo.name,
  "dbInfo-host": config.dbInfo.host,
  "dbInfo-port": config.dbInfo.port
});
```

ブラウザを起動してURLアドレス入力欄に `http://localhost:3333/api/dbInfo` を入れます。

### 処理結果.

```javascript
{"dbInfo-name": "testDB", "dbInfo-host": "localhost", "dbInfo-port": "5432"}
```

### 実行環境との連動.

実行環境[実行引数 or 環境変数]で、実行環境の切り替えが行えます、実行環境に応じた、confデータの切り替えが行えるので、本番環境や、ステージング環境、開発環境など、環境に応じてデータの定義を変更できます。

実行引数 :
```
> msful -e staging
> or 
> msful --env staging
```

環境変数.
```
> export MSFUL_ENV=staging
```

環境用のコンフィグファイルの読み込みとして[config] ではなく [envConf] で読み込みを行います.

confファイルの読み込みについて、説明します.

```
[conf]
  |
  +-- value.json => {name:"hoge"}
  |
  +-- [staging]
        |
        +-- value.json => {name: "moge"}
```

実行環境[staging]なので、envConf.value.name = moge として読み込まれる.

_

_

# mimeTypeの拡張について。

mimeTypeの拡張は、conf/mime.jsに対して、以下のように追加することで対応可能となります.

```javascript
// 拡張mimeTypeを設定します.
//
{
  "ファイル拡張子": "mimeType内容"
}
```

```javascript
// 例.
{
  "7z": "application/x-7z-compressed"
}
```

利用したい、ファイル拡張子をキーとして、それに紐づくmimeType内容を設定を設定します.

_

_

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)