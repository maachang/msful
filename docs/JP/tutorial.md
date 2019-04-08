# チュートリアル.

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

English documents [here](https://github.com/maachang/msful/blob/master/docs/ENG/tutorial.md)

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

_

_

単純にmsfulの仕様や使い方だけを説明されただけでは、非常に分かりづらいと思うので、簡単なチュートリアルを記載していきます。

流れとして、最低限作成に必要な条件を記載したいと思います。

## 「開発環境用の定義」を行う。

msfulコマンド時の起動で -e や --env で開発環境用の定義を行います。

何も定義していない場合は [development] となっているので、これを利用すれば良いでしょう。

_

_

## confファイルを整える.

confフォルダ配下にJSON形式のファイルを設置することで、ファイル名の拡張子抜き、たとえば[hoge.json]だと、[config.hoge] が、JSON情報としてconfigオブジェクトに紐づけされる。

システムで使う定義情報は、ここで定義を行おう。

また、先程の「開発環境用の定義」これを行った場合、その内容は「切り替えて」情報取得可能となっている。

たとえば「開発用」「ステージング用」「本番用」などの定義を「環境定義」で行うとして、それらを

```
開発用 : development
ステージング用 : staging
本番用 : production
```

した場合、それらのconf定義はそれぞれ

```
[conf]
 |
 +-[development]
 |  |
 |  +- 開発用のJSONファイル
 +-[staging]
 |  |
 |  +- ステージング用のJSONファイル
 +-[production]
    |
    +- 本番用のJSONファイル
```

のように定義することで、これらを[envConf]オブジェクトから取得が可能となる。

この辺の説明は[コンフィグ説明](https://github.com/maachang/msful/blob/master/docs/JP/next.md#configファイル機能)を参照してください.

_

_

## api実装を行う

api実装では、以下のことが行える.

### rtx.$ による、promise利用.

```javascript
// 例
return rtx.$().
  then(function(value) {
    // 正常系の場合.
    rtx.send({
      message:"成功"
    });

    // エラーの場合
    throw new HttpError(500, "エラー");
  })
```

promise時は、エラー時 `throw new HttpError` などのエラーハンドラを利用する。

### asyncによる、非同期利用.

```javascript
// 例
(async function() {
  // 正常系の場合.
  rtx.send({
    message:"成功"
  });

  // エラーの場合.
  rtx.error(500, "エラー");
})();
```

### 同期実行で返却.

```javascript
// 例
// 正常系の場合.
rtx.send({
  message:"成功"
});

// エラーの場合.
rtx.error(500, "エラー");
```

非同期実行で最終的にデータ送信が行われないと、HTTPタイムアウトまで処理が待たれることになるので、確実にsendされるように注意が必要となります。

rtxの使い方などは[rtx](#rtx機能について)を参照してください。

また、[request] や [response] などの使い方はnode標準モジュールの通り利用できます。

_

_

## msfulの固有機能

msfulの固有機能 jwt や closable や validate や entity これらは以下内容で、確認してください。

[jwt](https://github.com/maachang/msful/blob/master/docs/JP/base_mod.md#jwt)

[closable](https://github.com/maachang/msful/blob/master/docs/JP/base_mod.md#closable)

[validate](https://github.com/maachang/msful/blob/master/docs/JP/base_mod.md#validate)

[entity](https://github.com/maachang/msful/blob/master/docs/JP/base_mod.md#entity)

_

_

## 共通処理の実装と使い方.

共通処理を定義、実装する場合は libフォルダ配下に、require対象のスクリプト実装をすると良いだろう。

```
[lib]
 |
 +-- users.js  ユーザ共通処理系.
```

これを利用する場合は、以下のように[require]を利用すれば良い.

```javascript

var users = require("lib/users");
```

_

_

## filter機能.

apiの同一フォルダ上のスクリプトの共通実行処理をfilter機能で定義できます。

例えば、必ずそのフォルダ配下の処理が「ユーザ書き込み認証」をするとして、それをチェックする処理を「@filter.js」として、定義することで、そのフォルダ配下のapiスクリプト実行時に共通処理で呼ばれる.

### ユーザ書き込み権限のチェック処理.

サンプルを例とする.

```
[api]
 |
 +-- [user]
       |
       +-- @filter.js   ユーザ書き込み権限があるかチェックするフィルタ.
       |
       +-- create.js    ユーザを生成して書き込む処理.
       |
       +-- update.js    ユーザを更新して書き込む処理.
       |
       +-- delete.js    ユーザを削除する処理.
```

```javascript
// @filter.js
var users = require("lib/users");

if(users.isSignature(request, "user")) {
  return rtx.next();
} else {
  throw new HttpError(500, "書き込み権限がありません");
}
```

ここでは、ユーザ生成、更新、削除に対して、書き込み権限を持つ信頼ある通信のみ、実行可能とした共通処理を filter処理で行う。

ユーザ生成、更新、削除が実行したとき、まずはじめに@filter.jsが実行され、それが正常ならば [rtx.next()] で、実際のユーザ生成、更新、削除の処理が動く形となる。

_

_

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)