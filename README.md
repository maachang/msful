# msful is a Web API server for microservices.

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/README_JP.md)

msdul is a very easy and very simple web application server and aims to create ideas as soon as possible.

msful is RESTful and does not need to execute existing URL mapping, but uses directory-based URL access method, which enables more intuitive development.

A simple, thin framework, msful, so if you have experience developing with nodejs, or anyone who can handle web-based Javascript programs, you can develop quickly without requiring a lot of learning costs.

# Benefits of using msful

In the past, I mainly used spring-boot, a web application server that runs on java, and built a web application with Vert.x in Scala language.

Recently, the web application environment was also developed using express of node.

But I thought one time. The express web application server running on node is very inefficient in development.

That is, once express has modified the api program, it has to restart the node.

This "express" is reducing the development efficiency at "development time".

And they felt the same when they used java's spring-boot and scala's Vert.x.

Both spring-boot and Vert.x are the same as exporess, and it is necessary to modify the api program, and it was necessary to restart the server after each operation check.

I think that a lot of inefficiencies of java's web development are the cause of not being reflected to restart for api program update part.

It is not particularly good personally as a PHP language or Web server, but if the script of the target content is updated, PHP automatically reloads it, as there is no restart for the server. You can say that "development efficiency" is good.

I thought about various things and surveyed "I should make a Web application server with high development efficiency" I thought so and made msful.

With this, at least there is no restart of the node server, and confirmation of the api program update part can be taken immediately, so I think that the development cost of the Web application will be lower than express, and the development speed will increase.

I hope that msful developers can provide a better development environment for you.

# How to introduce msful

## Installation

※ It is assumed that nodepm is installed and npm can be used.

```
$ npm install -g msful
```

## Create a project.

Here we are creating a new project called myProject.

```
$ msful project myProject
$ cd myProject
```

## Create Content File

First of all, create a static HTML file. Static files such as HTML are created under html folder.

```
 $ vi html/index.html
```

```html
<html>
  <head> </head>
  <body>
    hoge !!
  </body>
</html>
```

## Create webapi file

Next we will create a dynamic web API. Web API files are created under the api folder.

```
 $ vi api/index.js
```

```javascript
rtx.send ({hello: "world"});
```

-msful start

Run msful server.

```
 $ msful
```

When it is executed, the following contents are displayed.
When such a display is displayed, it has started normally.
(The following is the number of CPUs for listen content

```cmd
## listen: 3333 env: [development] timeout: 15 (sec) contentCache: true pid: 13400
```

# Check the server execution result of msful.


Let's look at the static HTML file we created earlier.

Launch your browser and put `http://localhost:3333/` in the URL address input field.

Then, the following display content will be displayed on the browser.

```
 hoge !!
```

Next, let's look at the result of Web API.

Launch your browser and put `http://localhost:3333/api/` in the URL address input field.

Then, the following display content will be displayed on the browser.

```
 {"hello": "world"}
```

It is very easy, but msful can be used easily and intuitively like this.


# Description of msful server start option.

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

For this, if you do not set the execution environment to [staging], envConf.test.a = 1 will be acquired.

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
  With this setting, the conditions that can be acquired by the [config] instruction are switched to the folder under the conf file.

MSFUL_DEBUG
   export MSFUL_DEBUG = true
   Set the debug mode.
   If [true], a stack trace will be issued whenever an exception occurs.
```

# Web API Specific Features

## The following functions are available on WebApi.

```
> params: Information such as HTTP parameters, POST and GETQuery parameters.

> request: HTTP request object (node ​​standard).

> response: HTTP response object (node ​​standard).

> headers: HTTP headers group for HTTP response (associative array)

> rtx: Provides HTTP response content.
       These will be discussed later.
```

## About the rtx (Response-Context) function.

_

_

### rtx.send = function (body, status)
```
 Set the JSON data to be returned.

  body: Set the JSON to be returned.

  status: Sets the status to be returned.
```

```javascript
// Example
rtx.send ({hello: "world"}, 200);

> HTTP status 200, mimeType is `application/json; charset=utf-8;`
  {hello: "world"} will be returned as body information.
```

_

_

### rtx.binary = function (body, status, charset)
```
  Set the binary data to be returned.

   body: Sets the binary data to be returned.
          If set string, convert to binary according to charset.

   status: Sets the status to be returned.

   charset: Specify the character code. If not specified, it is utf-8.
             This information makes sense when body = string.
```

```javascript
// Example
rtx.binary (new Buffer ([0xe3, 0x81, 0x82]), 200);

> Send 'あ' UTF8 data in binary.

rtx.binary ("あ", 200, "utf-8");

> Send 'あ' UTF8 data in binary.

headers['Content-Type'] = "image/gif";
rtx.binary(new Buffer([0x00, 0x01, 0x02 .... ]), 200);;

> A sample of binary transmission with mimeType set.
```

_

_

### rtx.redirect = function (url, status)
```
 Set the redirect destination.

  url: Set the URL of redirect destination.

  status: Sets the status to be returned.
           This usually does not need to be set.
```

```javascript
// Example
rtx.redirect ("https://www.yahoo.co.jp/");

> It is redirected to the specified URL.
```

_

_

### rtx.error = function (status, message, e)
```
 Error message will be returned.

  status: Sets the error status.

  message: Sets an error message.

  e: Set exception information.
```

```javascript
// Example
rtx.error (500, "an error occurred");

> http error 500, mimeType is `application/json; charset=utf-8;`
   body information is {result: "error", error: 500, message: "an error occurred"}
   Will be returned.
```

_

_

### rtx.status = function (status)
```
 Set the return status.

  status: Sets the error status.
```

```javascript
// Example
rtx.status (status);

> Set return status with priority.
  In other words, this value is used when the status is not set.
```

_

_

### rtx.isSendScript = function ()
```
 If you want to process rtx.send, rtx.binary, rtx.error, rtx.redirect etc., true is returned.
```

```javascript
// Example
rtx.isSendScript ();

> If it has already been sent, true will be returned.
```

_

_

### rtx.isErrorSendScript = function ()
```
 If you want to do rtx.error processing, true is returned.
```

```javascript
// Example
rtx.isErrorSendScript ();

> If an error has already been sent, true will be returned.
```

_

_

### About rtx. $.
```javascript
// Example
return rtx. $ ()
  .then (function (rtx) {
    rtx.send ({
      message: "success"
    });
  })
  .catch (e) {
    console.log (e);
  }

```
```
Description:
 promise will be returned.
 Finally, as mentioned above, returning the result of promise will reflect the processing result.
 Also, the information of [rtx(ResponseContext)] is set to the first argument of function (rtx) for the first then.
 Also, exceptions etc. are passed by catch (e).
```

_

_

### rtx.push = function (call)
```
 Insert a script to execute with rtx.next ().
```

```javascript
// Example
rtx.push (function () {
  var a = 100;
})

// Example.
rtx.push ("./hoge/moge");

> The above process is executed when calling rtx.next ().

Also, if you set the first argument as a string, the specified script will not be loaded.

This process call is mainly used when you want to interrupt another process, such as filter process.
```

_

_

### rtx.size = function ()
```
 Get an executable number with rtx.next ().
```

```javascript
// Example
rtx.size ()

> Get an executable number with rtx.next ().
```

_

_

### rtx.next = function ()
```
 Execute the script set in rtx.push.
 In most cases, if there is @ filter.js, the original process is pushed, @ filter.js is executed, and rtx.next () is called internally.
```

```javascript
// Example
rtx.next ()

> Executes the process set in rtx.push.
```
_

_

## Examples of using WebAPI-specific features

### Implementation

```
 $ vi api/index.js
```

```javascript
value = "hoge: [" + params.hoge + "]"
value + = "method: [" + request.method + "]"
value + = "url: [" + request.url + "]"

rtx.send ({value: value})
```

### Browse by browser

http://localhost:3333/api/?hoge=abc

###  Processing result

```
 {value: "hoge: hoge: [abc] method: [GET] url: [/api/?hoge=abc]"}
```

### Receive

The reception result is set to `params` as it is.

_

_

## Filter function

Start when the folder where you placed the folder is accessed.

The main usage is assumed to be used for common check processing, for example, functions such as access authentication.

To create a filter, create a file called `@filter.js` under the target folder.

If it is satisfied as a filter function, that is, it is possible to perform the original call processing, it returns `rtx.next()`.

If it is not satisfied as a filter function, if you do not want to perform the original call processing, perform error processing with `etx.error` or use the` rtx.redirect` method etc.

_

_

# msful command information.

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
   -c [--cache] [true / false] Configure the content cache.
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

# config file function

If you create a file in JSON format under the `conf` folder, you can use the definition contents of JSON format in the program.

For example, if you create the file `/conf/hogehoge.conf`, you can use it in the executable program with JSON-style variables called` config.hogehoge`.

### Usage example

`. /conf/dbInfo.conf`
```javascript
{
    name: "testDB",
    host: "localhost",
    port: 5432
}
```

### Web API implementation using conf information

`. /api/dbInfo.js`
```javascript
// Example.
rtx.send ({
  "dbInfo-name": config.dbInfo.name,
  "dbInfo-host": config.dbInfo.host,
  "dbInfo-port": config.dbInfo.port
});
```

Start your browser and put `http://localhost:3333/api/dbInfo` in the URL address input field.

### Processing result.

```
{"dbInfo-name": "testDB", "dbInfo-host": "localhost", "dbInfo-port": "5432"}
```

### Link with the execution environment.

The execution environment can be switched using the execution environment [execution argument or environment variable], and conf data can be switched according to the execution environment. Therefore, data can be switched according to the environment such as production environment, staging environment, development environment, etc. You can change the definition.

Execution argument:
```
> msful -e staging
> or
> msful-env staging
```

Environment variable.
```
> export MSFUL_ENV = staging
```

Read configuration files for environment using [envConf] instead of [config].

```
[conf]
  |
  +-value.json => {name: "hoge"}
  |
  +-[staging]
        |
        +-value.json => {name: "moge"}
```

Since it is the execution environment [staging], it is read as envConf.value.name = moge.

_

_

# About extension of mimeType.

Extensions of mimeType can be supported by adding the following to [conf/mime.js].

```javascript
// Set extended mime type.
//
{
  "File extension": "mimeType content"
}
```

```javascript
// Example.
{
  "7z": "application/x-7z-compressed"
}
```

You want to use, set the mimeType contents linked to it with the file extension as the key.

_

_

# Basic module.

Describes the Web API and the modules required for microservice development.

_

_

## jwt module.

Use JWT `json-web-token` for login authentication etc.

_

_

### jwt.create (key, payload)

Generate JWT.

#### key

Set the key to create a token.

#### payload

Sets the payload string.

#### Example of use

```javascript
jwt.create ("hoge", "{a: 100}");
```

#### Processing result

```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW / AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0"
```

### jwt.payload (jwt)

Get payload information from jwt information.

#### jwt

Set JWT information.

#### Example of use

```javascript
jwt.payload (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW / AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

#### Processing result

```
{a: 100}
```

_

_

### jwt.validate (key, jwt)

Confirm that the specified JWT information is the information generated with the specified key and that the payload information etc. has not been changed.

### key

Set the key to create a token.

#### jwt

Set jwt information.

#### Usage example (success)

```javascript
jwt.validate ("hoge",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW / AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

#### Processing result

```
true
```

#### Usage example (failure)

```javascript
jwt.validate ("moge",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW / AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

#### Processing result

```
false
```

_

_

# closeable

It is used when you want to perform processing that you want to execute closing processing surely after processing is completed.

※ However, you can not use from the console.

## closeable.register (obj)

Register the process to perform close process in closeable.

#### obj

The target is an object type, and you need to include the close method inside.

#### Example of use

```javascript
closeable.register ({close: function () {console.log ("hoge");}});
```

After executing the above-mentioned API, the following message will be displayed on the terminal running msful.

```
hoge
```

_

_

## closeable.close ()

Close all content registered by the registration method.
However, this process does not usually need to be called, and will be called automatically immediately after the execution of api.

_

_

# validate

Performs POST and GET parameter validation processing.

The parameters mentioned here refer to the contents of `params`.

In addition, it is possible to set a default value when it does not exist in the default setting, and to change a parameter name in the rename setting.

_

_

## validation

-Argument description

```
validate (method,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck
)
```

** method **:

Set the accessible Http method. If omitted, all Http methods are allowed.

** paramName **:

Set the target parameter name.

** dataType **:

Set the data type of target parameter name. The items that can be set are as follows.

| Type Name | Description |
|:-----------|:--------|
| string | Convert to string |
| Convert to integer |
| float | convert to floating point |
| bool | Convert to BOOLEAN type |
| convert to date object |
| Convert to Array object |
| object | convert to object |

The `object` and` list` types are specified when the contents of params are the same type.

** executeAndCheck **:

Condition setting to check and change the state for `paramName`.

| Definition name | Setting example | Setting example explanation |
|:-----------|:--------|:--------------------|
| none | "none" | Do nothing |
| required | "required" | Error if the data is empty |
| min num | "min 5" | Error if less than 5 (String.length <5 or Number <5) |
| max num | "max 5" | Error if greater than 5 (String.length> 5 or Number> 5) |
| range min max | "range 5 12" | Error if 5 or more and 12 or less |
| regex | "regex 'hoge'" | Error if the word `hoge` does not exist |
| url | "url" | Error if not in URL format |
| email | "email" | Error if not in email format |
| date | "date" | Error if not in `yyyy-MM-dd` format |
| time | "time" | Error if not in `HH: mm` format |
| timestamp | "timestamp" | Error if Date object gets NaN |
| default | "default 0" | Set 0 if the data is empty |
| rename | "rename 'abc'" | Rename the parameter name to `abc` |

This definition can be set consecutively with `|`.

```javascript
// Example
"min 5 | max 12 | url"
```

#### validate setting example

/api/exampleValidate.js
```javascript
validate ("POST",
    "name", "string", "req",
    "age", "number", "default 18",
    "lat", "float", "default 0.0",
    "comment", "string", "max 128",
    "X-Test-Code", "string", "req"
);

return {value: JSON.stringify (params)};
```

##### Implementation content for accessing with Ajax.

```javascript
fetch ('http://localhost:3333/api/exampleValidate', {
  method: 'POST',
  body: JSON.stringify (sendParams),
  headers: {
    'Content-Type': 'application/json;charset=utf-8;',
    'X-Test-Code': 'test'
  }
}).
```

##### Send data contents in Ajax (normal).

```javascript
var sendParams = {
  name: "maachang",
  age: 30,
  comment: "hogehoge",
}
```

#### Processing result

```
{"name": "maachang", "age": 30, "lat": 0.0, "comment": "hogehoge", "X-Test-Code": "test"}
```

##### Send data contents in Ajax (error).

```javascript
var sendParams = {
  age: 30,
  comment: "hogehoge",
}
```

#### Processing result

```
{result: "error", status: 400, message: "Contents of 'name' are mandatory"}
```

_

_

# entity

Defines the formatting of data in JSON format.

For example, we have acquired data with many columns from the database, but if the return conditions are not so large, it may be cumbersome to implement a conversion program on our own.
Besides, JS implements a program that considers receiving by numerical value because there is no type in JS, but in this side return, it becomes a character string and error processing etc. It will be bothersome and maintenance issues as well.

Entities are used to clean up those annoying problems.

_

_

## entity.expose

Defines the format of JSON.

It formats the data in JSON format and defines that the definition name is set as the first argument.
For the second and subsequent arguments, define `parameter name`,` parameter type`, and `processing content`.

#### Definition Description

```
entity.expose (name,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck
)
```

** name **:

 Set the definition name.

** paramName **:

Set the target parameter name.

** dataType **:

Set the data type of target parameter name. The items that can be set are as follows.

| Type Name | Description |
|:-----------|:--------|
| string | Convert to string |
| Convert to integer |
| float | convert to floating point |
| bool | Convert to BOOLEAN type |
| convert to date object |
| Convert to Array object |
| object | convert to object |
| Set another entity.expose definition name and create a new indent. |
| Start indentation of the object. |
| End the indent of the object. |

The `object` and` list` types are specified when the contents of params are the same type.

The `$ name` type is used as follows:

```javascript
// Example
entity.expose ("user",
  "name", "string", "",
  "age", "number", "",
);
entity.expose ("users",
  "list", "$ user", ""
);

var res = {
  list: [
    {name: "maachang", age: 18},
    {name: "saito", age: 21}
  ]
};

return entity.make ("users", res);
```

** <Result> **
```
{
  "list": [
    {"name": "maachang", "age": 18},
    {"name": "saito", "age": 21}
  ]
}
```

 The `{` and `}` types are used as follows:

```javascript
// Example
entity.expose ("user",
  "name", "string", "",
  "age", "number", "",
  "details": "{", "",
  "nickName": "string", "",
  "comment": "string", "",
  "details": "}", ""
);

{
  name: "maachang",
  age: 18,
  nickName: "hoge",
  comment: "mogemoge"
}

return entity.make ("user", res);
```

** <Result> **
```
{
  name: "maachang",
  age: 18,
  details: {
    nickName: "hoge",
    comment: "mogemoge"
  }
}
```

** executeAndCheck **:

Condition setting to check and change the state for `paramName`.

| Definition name | Setting example | Setting example explanation |
|:-----------|:--------|:--------------------|
| none | "none" | Do nothing |
| required | "required" | Error if the data is empty |
| min num | "min 5" | Error if less than 5 (String.length <5 or Number <5) |
| max num | "max 5" | Error if greater than 5 (String.length> 5 or Number> 5) |
| range min max | "range 5 12" | Error if 5 or more and 12 or less |
| regex | "regex 'hoge'" | Error if the word `hoge` does not exist |
| url | "url" | Error if not in URL format |
| email | "email" | Error if not in email format |
| date | "date" | Error if not in `yyyy-MM-dd` format |
| time | "time" | Error if not in `HH: mm` format |
| timestamp | "timestamp" | Error if Date object gets NaN |
| default | "default 0" | Set 0 if the data is empty |
| rename | "rename 'abc'" | Rename the parameter name to `abc` |

This definition can be set consecutively with `|`

```javascript
// Example
"min 5 | max 12 | url"
```

## entity.make

Check and convert target JSON for the definition created in `entity.expose`.

#### name

Set the definition name created in `entity.expose`.

##### value

Set the JSON information of conversion target.

#### Example of use

```javascript
entity.expose ("user",
  "name", "string", "",
  "age", "number", "",
  "details": "{", "",
  "nickName": "string", "",
  "comment": "string", "",
  "details": "}", ""
);

var res = {
  name: "maachang",
  age: 18,
  nickName: "hoge",
  comment: "mogemoge"
}

return entity.make ("user", res);
```

#### Processing result

```
{
  name: "maachang",
  age: 18,
  details: {
    nickName: "hoge",
    comment: "mogemoge"
  }
}
```