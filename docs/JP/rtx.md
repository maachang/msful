# rtx(Response Context)に対する説明

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

English documents [here](https://github.com/maachang/msful/blob/master/docs/ENG/rtx.md)

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

_

_

rtxは、HTTPレスポンス処理を行う処理群として、提供されます.

```javascript

rtx.send({hello: "world"})
```

とすることで、レスポンスに対して、mimeTypeが `application/json; charset=utf-8;` で body情報として、{hello: "world"} が返却されます.

このように、主にrtxはHTTPレスポンスを返却したい場合に利用します.

_

_

## rtx.send = function(body, status)
```
 返却するJSONデータを設定します.

  body : 返却するJSONを設定します. 

  status : 返却するステータスを設定します. 
```

```javascript
// 例
rtx.send({hello: "world"}, 200);

> HTTPステータス200で、mimeTypeが `application/json; charset=utf-8;` で 
  body情報として、{hello: "world"} が返却されます.
```

_

_

## rtx.binary = function(body, status, charset)
```
 返却するバイナリデータを設定します.

  body : 返却するバイナリデータを設定します.
         文字列を設定した場合、charsetに応じてバイナリに変換します.

  status : 返却するステータスを設定します. 

  charset : 文字コードを指定します。指定しない場合は、utf-8になります。
            この情報は、body=stringの場合に意味を成します.
```

```javascript
// 例
rtx.binary(new Buffer([0xe3, 0x81, 0x82]), 200);

> 'あ' のUTF8のデータをバイナリで送信する.

rtx.binary("あ", 200, "utf-8");

> 'あ' のUTF8のデータをバイナリで送信する.

headers['Content-Type'] = "image/gif";
rtx.binary(new Buffer([0x00, 0x01, 0x02 .... ]), 200);

＞ mimeTypeを設定した、バイナリ送信のサンプル.

```
_

_

## rtx.redirect = function(url, status)
```
 リダイレクト先を設定します。

  url : リダイレクト先のURLを設定します.

  status : 返却するステータスを設定します. 
           これは通常設定する必要はありません.
```

```javascript
// 例
rtx.redirect("https://www.yahoo.co.jp/");

> 指定URLにリダイレクトされる.
```

_

_

## rtx.error = function(status, message, e)
```
 エラーメッセージを返却します.

  status : エラーステータスを設定します.

  message : エラーメッセージを設定します.

  e : 例外情報を設定します.
```

```javascript
// 例
rtx.error(500, "エラーが発生しました");

> httpエラー500 で 、mimeTypeが `application/json; charset=utf-8;` で
  body情報が {result: "error", error: 500, message: "エラーが発生しました"} 
  が返却されます.
```

_

_

## rtx.status = function(status)
```
 返却ステータスを設定します.

  status : エラーステータスを設定します.
```

```javascript
// 例
rtx.status(status);

> 返却ステータスを優先的に設定します.
  つまり、ステータスが未設定の場合はこの値が利用されます。
```

_

_

## rtx.isSendScript = function()
```
 rtx.send, rtx.binary, rtx.error, rtx.redirect などの処理を行ったい場合、trueが返却されます.
```

```javascript
// 例
rtx.isSendScript();

> すでに送信済みの場合は、trueが返却されます.

// 送信前.
console.log("[送信前]rtx.isSendScript():" + rtx.isSendScript())

rtx.send({hello: "world"}, 200);

// 送信後.
console.log("[送信後]rtx.isSendScript():" + rtx.isSendScript())

// 処理結果.
＞ [送信前]rtx.isSendScript(): false
＞ [送信後]rtx.isSendScript(): true
```

_

_

## rtx.isErrorSendScript = function()
```
 rtx.error 処理を行ったい場合、trueが返却されます.
```

```javascript
// 例
rtx.isErrorSendScript();

> すでにエラーが送信済みの場合は、trueが返却されます.

// 送信前.
console.log("[error送信前]rtx.isErrorSendScript():" + rtx.isSendScript())

rtx.error(500, "error");

// 送信後.
console.log("[error送信後]rtx.isErrorSendScript():" + rtx.isSendScript())

// 処理結果.
＞ [送信前]rtx.isErrorSendScript(): false
＞ [送信後]rtx.isErrorSendScript(): true
```

_

_

## rtx.$ について。
```javascript
// 例
return rtx.$()
  .then(function(rtx) {
    rtx.send({
      message:"成功"
    });
  })
  .catch(e) {
    throw e;
  }
```

```
説明:
 promiseが返却されます.
 最終的に上記のように、promiseの結果をreturnすることで、処理結果が反映されます.
 また最初の then に対するfunction(rtc) の第一引数には [rtx(ResponseContext)] の情報がセットされます.
 また、例外などは、catch(e)で渡されます.
```

_

_

## rtx.push = function(call)
```
 rtx.next()で実行する、スクリプトを挿入します.
```

```javascript
// 例
rtx.push(function() {
  var a = 100;
})

// 例.
rtx.push("./hoge/moge");

> 上記処理はrtx.next()の呼び出しを行った時に処理が実行されます.

また、第一引数を文字列で設定した場合は、指定されたスクリプトが読み込稀ます.

この処理の呼び出しは filter 処理などで、別の処理を割り込ませたい時に主に利用します.

```

_

_

## rtx.size = function()
```
 rtx.next()で実行可能な数を取得します.
```

```javascript
// 例
rtx.size()

> rtx.next()で実行可能な数を取得します.
```

_

_

## rtx.next = function()
```
 rtx.pushでセットされたスクリプトを実行します.
 大体の場合、@filter.js がある場合、元の処理がpushされて、@filter.jsが実行され、内部的にrtx.next()が呼び出されます.
```

```javascript
// 例
rtx.next()
 
> rtx.pushで設定された処理を実行します.
```

_

_

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

