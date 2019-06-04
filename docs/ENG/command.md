# msful start command description

<p align = "center">
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/dt/msful.svg" alt = "Downloads"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/v/msful.svg" alt = "Version"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/l/msful.svg" alt = "License"> </a>
</ p>

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/docs/JP/command.md)

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README.md)

_

_
## project command

### Create a new project

Execute the following command.

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

Or this command.

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

### Creation result.

```
 $ ls -la
drwxr-xr-x 1 root 197121 0 Apr 14 23:29.
drwxr-xr-x 1 root 197121 0 Apr 8 17:27 ..
drwxr-xr-x 1 root 197121 0 Apr 5 18:38 api
drwxr-xr-x 1 root 197121 0 Apr 14 23:14 conf
drwxr-xr-x 1 root 197121 0 Apr 3 01:17 html
drwxr-xr-x 1 root 197121 0 Apr 14 23:29 lib
drwxr-xr-x 1 root 197121 0 Apr 14 23:29 .server_id
drwxr-xr-x 1 root 197121 0 Apr 14 23:29 package.json
```

_

_

## help command

### You can see the command description of msful

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
   -s [--close] [true/false] Close after sending content.
   -e [--env] Set the execution environment conditions of msful.
   -l [--cluster] Set the number of clusters of HTTP execution part of msful.
```

_

_

## version output.

### Output the current version of msful.

```
  $ msful version
```

```
msful (micro service RESTFul API Server) v0.1.20
Copyright (c) 2019 maachang.
```

_

_

## Regenerate serverId.

### Reissue the server ID possessed by msful.

```
  $ msful msfulId
```

```
new id: 68716cfd-3cdf-89ae-770a-38390b962625
```

_

_

## console function

Execute file in interactive mode or file specification on msful project environment.

### Run in interactive mode

```
msful console
```

Great for trying out some simple features.


#### Execute specified JS file

```
msful console [js-filename]
```

As a use, I think that it is good to use by batch execution etc.

_

_

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README.md)