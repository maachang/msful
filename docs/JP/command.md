# msful起動コマンド説明

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

English documents [here](https://github.com/maachang/msful/blob/master/docs/ENG/command.md)

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

_

_
## projectコマンド

### 新しいプロジェクトを作成する

以下のコマンドを実行します.

```
 $ mkdir example
 $ cd example
 $ msful project example
 msful(micro service RESTFul API Server) v0.1.0
 Copyright(c) 2019 maachang.
 
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
 msful(micro service RESTFul API Server) v0.1.0
 Copyright(c) 2019 maachang.
 
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

### 作成結果.

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

_

_

## helpコマンド

### msfulのコマンド説明が見れます

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

_

_

## console機能

msfulのプロジェクト環境上で、対話モードまたはファイル指定でファイルを実行します。

### 対話モードで実行

```
msful console
```

何か、簡単な機能を試す場合に最適です。


#### 指定されたJSファイルを実行

```
msful console [js-filename]
```

用途としては、バッチ実行などで利用するとよいかと思います。

_

_

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)