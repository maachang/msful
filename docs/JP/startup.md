# msfulの起動設定説明.

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

English documents [here](https://github.com/maachang/msful/blob/master/docs/ENG/startup.md)

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

_

_

## ポート番号を変更して起動します.

```
 msful -p 8080
```

or 

```
 msful --port 8080
```

```cmd
## listen: 8080 env:[development] timeout:15(sec) contentCache:true pid:13400

```

_

_

## 実行環境を設定します.

msful実行環境を設定します。

環境用のコンフィグ定義は[envConf]で取得します。

confで取得される定義が、指定実行環境名と同じ、対象フォルダ名をカレントディレクトリとします.。

たとえば、conf配下のフォルダ構成が以下だとして 

~~~
[conf]
 |
 +-[test.js] => {a:1}
 |
 +-[staging]
     |
     +-[test.js] => {a:10}
~~~

コレに対して、実行環境を[staging]にしない場合は,envConf.test.a = 1 が取得されます. 

実行環境を[staging]にした場合は、envConf.test.a = 10 となります. 

このように、実行環境に対する、conf定義の切り替えが可能となっています.

```
 msful -e staging
```

or 

```
 msful --env staging
```

```cmd
## listen: 3333 env:[staging] timeout:15(sec) contentCache:true pid:13400

```

_

_

## 静的なコンテンツに対して、キャッシュを行う／行わないように設定します。

このオプションはたとえば、システムの開発中にHTMLやjsファイルなどの静的コンテンツファイルがキャッシュされることで、更新内容が反映されてないなどの問題がありますが、そのような場合に利用するとよいでしょう。

```
 msful -c false
```

or 

```
 msful --cache false
```

```cmd
## listen: 3333 env:[development] timeout:15(sec) contentCache:false pid:13400

```

_

_

## 通信タイムアウト値を設定.

このオプションはレスポンスを返却するタイムアウトを設定します。またこの単位は「ミリ秒」単位で設定します

```
 msful -t 25000
```

or 

```
 msful --timeout 25000
```

```cmd
## listen: 3333 env:[development] timeout:25(sec) contentCache:true pid:13400
```

_

_

## 起動クラスター数を設定.

このオプションは、msfulで起動するHTTP実行部分のクラスタ数を設定します。

ただ、通常はCPU数に合わせてくれるので、設定が必要な場合に利用します。

```
 msful -l 1
```

or 

```
 msful --cluster 1
```

```cmd
## listen: 3333 env:[development] timeout:25(sec) contentCache:true pid:13400
```

_

_

## 環境変数でも設定可能

また、これらの設定は環境変数上でも同様に行えます.

```cmd
MSFUL_PORT
  export MSFUL_PORT=4444
  msful起動時のバインドポートが変更できます.

MSFUL_TIMEOUT
  export MSFUL_TIMEOUT=25000
  レスポンスタイムアウト値を「ミリ秒」単位で設定します.

MSFUL_CONTENTS_CACHE
  export MSFUL_CONTENTS_CACHE=false
  静的なコンテンツに対して、キャッシュをする(true)、しない(false)を設定します.

MSFUL_ENV
  export MSFUL_ENV=staging
  実行環境を設定します.
  この設定により、confファイル配下のフォルダに[envConf]命令で取得可能な条件が切り替わります.

MSFUL_DEBUG
  export MSFUL_DEBUG=true
  デバッグモードを設定します。
  [true]の場合は、例外が発生した時に必ずスタックトレースを出します.

MSFUL_CLUSTER
  export MSFUL_CLUSTER=1
  クラスタ起動条件を設定します.
  この設定により、msfulのHTTP実行部分のクラスタ起動の数を変更できます.
```
_

_

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)