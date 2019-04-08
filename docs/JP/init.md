# msfulの導入に対する説明

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

English documents [here](https://github.com/maachang/msful/blob/master/docs/ENG/init.md)

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

_

_

## インストール

※ nodejsがインストールされていって npm が利用できることが前提です。

```
$ npm install -g msful
```

## プロジェクトを作成する.

ここでは myProject と言う新しいプロジェクトを作成しています。

```
$ msful project myProject
$ cd myProject
```

## コンテンツファイルの作成

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

## webapiファイルの作成

次に動的なWebAPIを作成します。WebAPIのファイルは、apiフォルダ配下に作成します。

```
 $ vi api/index.js
```

```javascript
rtx.send({hello: "world"});
```

- msful起動

msfulをサーバ実行します。

```
 $ msful
```

実行すると、以下のような内容が表示されます。
このような表示がされた場合、正常に起動しています。
（以下listen内容はCPU数出ます)

```cmd
## listen: 3333 env:[development] timeout:15(sec) contentCache:true pid:13400
```

_

_

# msfulのサーバ実行結果を確認


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

_

_

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)