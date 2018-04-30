# msful for development.

This is a group of folders containing supporting environment for msful development.

## setup

Set the following environment variables.

```
 MSFUL_HOME
```

## command

Usage is same as `msful`.

```
 fsful
```

## example

```
>$ pwd
/home/maachang/msful
>$ ls
bin  index.js  lib  MIT-LICENSE.txt  package.json  README.md
>$ 
>$ echo "export MSFUL_HOME=/home/maachang/msful" >> /etc/profile
>$ echo "export PATH=${MSFUL_HOME}/bin:$PATH" >> /etc/profile
>$
>$ source /etc/profile
>$ 
>$ cd ~/
>$ mkdir myproj
>$ cd myproj
>$ fsful project test
msful(micro service RESTFul API Server) v0.0.26
Copyright(c) 2018 maachang.

new test project.
 [html]directory.
   It stores static files (HTML, JS, CSS, Images) here.
 [api]directory    Here, we store RESTFul API programs implemented by JS.
 [lib]directory.
   This is a folder for storing JS libraries.
 [conf]directory.
   This is a folder for storing configuration information in JSON format.
>$
>$ cd test
>$ ls
api  conf  html  lib
>$
>$ fsful
msful(micro service RESTFul API Server) v0.0.26
Copyright(c) 2018 maachang.

## listen: 3333 pid:754
## listen: 3333 pid:755
## listen: 3333 pid:756
## listen: 3333 pid:757
```
