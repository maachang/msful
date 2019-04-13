English documents [here](https://github.com/maachang/msful/blob/master/bin/README.md)

_

_

# msful 開発者向けの設定.

この情報は、msfulを開発する人向けのものです。

なので、必要の無い方にはあまり意味がないかも知れないです。

_

_

## 目的.

msful自身を開発していると、色々とバージョンアップしたとして、それを簡単に試したいですよね。

だけど、毎回起動が面倒な状況になっています。

```sh
node /home/maachang/msful/index args args args ....
```

> args args args ....はmsfulに渡すパラメータです。

> `/home/maachang/msful` は、msful本体のパスです。

これだと、msfulを修正した時に毎度上記を実行するのも面倒ですよね。

なので、msful開発向けの起動は `fsful` と言うコマンドで、させるようにします。

_

_

## まずは gitから msfulをダウンロード.

まず、msfulをgitのブランチから適当にダウンロードします。

（既にしている方は無視してください）

```sh
mkdir /home/maachang/msful
cd /home/maachang/msful

git clone https://github.com/maachang/msful.git
```

今回インストールするパスを `/home/maachang/msful` として説明していきます。

_

_

## 環境変数をprofileに登録.

```sh
$ echo "export MSFUL_HOME=/home/maachang/msful" >> /etc/profile
$ echo "export PATH=${MSFUL_HOME}/bin:$PATH" >> /etc/profile
```

_

_

## fsfulコマンド

使い方は `msful`と同じです。

```sh
$ fsful
msful(micro service RESTFul API Server) v0.1.22
Copyright(c) 2019 maachang.
 id: 594d5954-3c06-1639-141b-cf2b1e70c67e

## listen: 3333 env:[development] timeout:15(sec) contentCache:true pid:37444
## listen: 3333 env:[development] timeout:15(sec) contentCache:true pid:37445
## listen: 3333 env:[development] timeout:15(sec) contentCache:true pid:37447
## listen: 3333 env:[development] timeout:15(sec) contentCache:true pid:37446
```

