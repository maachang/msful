# Description of msful startup settings.

<p align = "center">
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/dt/msful.svg" alt = "Downloads"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/v/msful.svg" alt = "Version"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/l/msful.svg" alt = "License"> </a>
</p>

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/docs/JP/startup.md)

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

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
## listen: 8080 env: [development] timeout: 15 (sec) contentCache: true pid: 13400

```

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
## listen: 3333 env: [staging] timeout: 15 (sec) contentCache: true pid: 13400

```

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
## listen: 3333 env: [development] timeout: 15 (sec) contentCache: false pid: 13400

```

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
## listen: 3333 env: [development] timeout: 25 (sec) contentCache: true pid: 13400
```

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
  Set caching (true) and not (false) for static content.

MSFUL_ENV
  export MSFUL_ENV = staging
  Set the execution environment.
  With this setting, the conditions that can be acquired by the [envConf] instruction are switched to the folder under the conf file.

MSFUL_DEBUG
  export MSFUL_DEBUG = true
  Set the debug mode.
  If [true], a stack trace will be issued whenever an exception occurs.
```
_

_

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README_JP.md)