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
 $ msful project
  msful(micro service RESTFul API Server) v0.1.20
  Copyright(c) 2019 maachang.

  new project.

  [html] directory.
    It stores static files (HTML, JS, CSS, Images) here.
  [api] directory.
    Here, we store RESTFul API programs implemented by JS.
  [lib] directory.
    This is a folder for storing JS libraries.
  [conf] directory.
   This is a folder for storing configuration information in JSON format.

  id: 1b463ccb-777d-ad6f-1668-e1491c0db6ca
```

もしくはこのコマンド.

```
 $ msful project example
  msful(micro service RESTFul API Server) v0.1.20
  Copyright(c) 2019 maachang.

  new example project.

  [html] directory.
    It stores static files (HTML, JS, CSS, Images) here.
  [api] directory.
    Here, we store RESTFul API programs implemented by JS.
  [lib] directory.
    This is a folder for storing JS libraries.
  [conf] directory.
   This is a folder for storing configuration information in JSON format.

  id: 1b463ccb-777d-ad6f-1668-e1491c0db6ca
  
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
drwxr-xr-x 1 root 197121 0 Apr 14 23:29 .msful_Id
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
   version: Print version information.
   msfulId: Regenerate server ID.
   -p [--port] number Set the server bind port number.
   -t [--timeout] Set HTTP response timeout value.
   -c [--cache] [true/false] Configure the content cache.
   -e [--env] Set the execution environment conditions of msful.
   -l [--cluster] Set the number of clusters of HTTP execution part of msful.
```

_

_

## version出力.

### msfulの現在のバージョンを出力します.

```
 $ msful version
```

```
msful(micro service RESTFul API Server) v0.1.20
Copyright(c) 2019 maachang.
```

_

_

## serverIdを再生成.

### msfulが持つ、サーバIDを再発行します.

```
 $ msful msfulId
```

```
new id: 68716cfd-3cdf-89ae-770a-38390b962625
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