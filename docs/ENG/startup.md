# Description of msful startup settings.

<p align = "center">
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/dt/msful.svg" alt = "Downloads"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/v/msful.svg" alt = "Version"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/l/msful.svg" alt = "License"> </a>
</p>

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/docs/JP/startup.md)

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README.md)

_

_

## Change the port number and start.

```
 msful -p 8080
```

or

```
 msful --port 8080
```

```cmd
msful(micro service RESTFul API Server) v0.1.20
Copyright(c) 2019 maachang.
 id: 594d5954-3c06-1639-141b-cf2b1e70c67e

## listen: 8080 env: [development] timeout: 15(sec) contentCache: true pid: 13400

```

_

_

## Set the execution environment.

Set the msful execution environment.

The configuration definition for the environment is acquired with [envConf].

The definition acquired by conf is the same as the specified execution environment name, and the target folder name is the current directory.

For example, if the folder configuration under conf is

~~~
[conf]
 |
 +-[test.js] => {a: 1}
 |
 +-[staging]
     |
     +-[test.js] => {a: 10}
~~~

If you do not set the execution environment to [staging] for this, envConf.test.a = 1 will be acquired.

If you set the execution environment to [staging], envConf.test.a = 10.

Thus, it is possible to switch conf definitions for the execution environment.

```
 msful -e staging
```

or

```
 msful-env staging
```

```cmd
msful(micro service RESTFul API Server) v0.1.20
Copyright(c) 2019 maachang.
 id: 594d5954-3c06-1639-141b-cf2b1e70c67e

## listen: 3333 env: [staging] timeout: 15(sec) contentCache: true pid: 13400

```

_

_

## Set to enable or disable caching of static content.

This option has the problem that, for example, static content files such as HTML and js files are cached during system development, so the updated contents are not reflected, etc. I will.

```
 msful -c false
```

or

```
 msful --cache false
```

```cmd
msful(micro service RESTFul API Server) v0.1.20
Copyright(c) 2019 maachang.
 id: 594d5954-3c06-1639-141b-cf2b1e70c67e

## listen: 3333 env: [development] timeout: 15(sec) contentCache: false pid: 13400

```

_

_

# Close connection after sending static content.

There is a function called keepAlive in http communication, but with this function, you can reuse communication.

For static content, keepAlive should be on unless there is a special reason.

However, if you want to close the connection, you can disable keepAlive by setting (true).

```
  msful -s false
```

or

```
  msful --close false
```

_

_

## Set communication timeout value.

This option sets the timeout for returning the response. Also, this unit is set in "milliseconds"

```
 msful -t 25000
```

or

```
 msful --timeout 25000
```

```cmd
msful(micro service RESTFul API Server) v0.1.20
Copyright(c) 2019 maachang.
 id: 594d5954-3c06-1639-141b-cf2b1e70c67e

## listen: 3333 env: [development] timeout: 25(sec) contentCache: true pid: 13400
```

_

_

## Set the number of boot clusters.

This option sets the number of clusters of HTTP execution part to start with msful.

However, since it usually matches the number of CPUs, it is used when the setting is necessary.

```
  msful -l 1
```

or

```
  msful --cluster 1
```

```cmd
msful(micro service RESTFul API Server) v0.1.20
Copyright(c) 2019 maachang.
 id: 594d5954-3c06-1639-141b-cf2b1e70c67e

## listen: 3333 env: [development] timeout: 25 (sec) contentCache: true pid: 13400
```

_

_

## Can also be set by environment variable

Also, these settings can be done in the same way on environment variables.

```cmd
MSFUL_PORT
  export MSFUL_PORT = 4444
  You can change the bind port at msful startup.

MSFUL_TIMEOUT
  export MSFUL_TIMEOUT = 25000
  Set response timeout value in "milliseconds".

MSFUL_CONTENTS_CACHE
  export MSFUL_CONTENTS_CACHE = false
  Set caching(true) and not(false) for static content.

MSFUL_CONTENTS_CLOSE
  export MSFUL_CONTENTS_CLOSE = false
  If you want to close after sending (static) for static content, set it not (false).

MSFUL_ENV
  export MSFUL_ENV = staging
  Set the execution environment.
  With this setting, the conditions that can be acquired by the [envConf] instruction are switched to the folder under the conf file.

MSFUL_DEBUG
  export MSFUL_DEBUG = true
  Set the debug mode.
  If [true], a stack trace will be issued whenever an exception occurs.

MSFUL_CLUSTER
   export MSFUL_CLUSTER = 1
   Set the cluster start condition.
   This setting allows you to change the number of cluster launches for the msful HTTP execution part.
```
_

_

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README.md)