# msful start command description

<p align = "center">
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/dt/msful.svg" alt = "Downloads"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/v/msful.svg" alt = "Version"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/l/msful.svg" alt = "License"> </a>
</ p>

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/docs/JP/command.md)

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

_

_
## project command

### Create a new project

Execute the following command.

```
 $ mkdir example
 $ cd example
 $ msful project example
 msful (micro service RESTFul API Server) v0.1.0
 Copyright (c) 2019 maachang.
 
 new project !!
  [html] directory.
    It stores static files (HTML, JS, CSS, Images) here.
  [api] directory
    Here, we store RESTFul API programs implemented by JS.
  [lib] directory
    This is a folder for storing JS libraries.
  [conf] directory
    This is a folder for storing configuration information in JSON format.
```

Or this command.

```
 $ msful project example
 msful (micro service RESTFul API Server) v0.1.0
 Copyright (c) 2019 maachang.
 
 new example project.
  [html] directory.
    It stores static files (HTML, JS, CSS, Images) here.
  [api] directory Here, we store RESTFul API programs implemented by JS.
  [lib] directory.
    This is a folder for storing JS libraries.
  [conf] directory.
    This is a folder for storing configuration information in JSON format.
  
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
   help: Display help information.
   console: At the console, run JS on line.
   console [file]: Run the specified file on the console.
   -p [--port] number Set the server bind port number.
   -c [--cache] [true/false] Configure the content cache.
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

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README_JP.md)