日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/bin/README_JP.md)

_

_

# Setting for msful developers.

This information is for people developing msful?

So it may not make much sense to those who do not need it.

_

_

## the purpose.

If you are developing msful itself, and have upgraded many versions, you want to try it easily.

But every time I start, it's a bothersome situation.

```sh
node /home/maachang/msful/index args args args ....
```

> args args args .... are the parameters to pass to msful.

> `/home/maachang/msful` is the msful body path.

In this case, it is also troublesome to execute the above every time you correct msful.

So, start up for msful development with the command `fsful`.

_

_

## First download msful from git.

First, download msful properly from the git branch.

(Please ignore those already doing)

```sh
mkdir /home/maachang/msful
cd /home/maachang/msful

git clone https://github.com/maachang/msful.git
```

We will explain the installation path this time as `/home/maachang/msful`.

_

_

## Register environment variables in profile.

```sh
$ echo "export MSFUL_HOME=/home/maachang/msful" >> /etc/profile
$ echo "export PATH=${MSFUL_HOME}/bin:$PATH" >> /etc/profile
```

_

_

## fsful command

The usage is the same as `msful`.

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