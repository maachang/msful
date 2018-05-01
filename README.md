# msful is Web API server for micro service

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

msdul is a very simple and very simple web application server aiming at creating ideas as soon as possible.

msful does not need to perform existing URL mapping in RESTful, it adopts directory-based WebAPI I/O, so more intuitive development is possible.

msful, with a simple and thin framework, those who can build Javascript programs will be able to learn and develop without requiring much learning cost.

I hope that you can provide a fun development environment.

# usage

Install.
```
 $ npm install -g msful
```

Create a project for msful.

```
 $ msful project myProject
 $ cd myProject

```

Place a static file in the html folder and place a javascript file that generates RESTful in the api folder.

```
 $ vi html/index.html
```

```html
<html>
  <head></head>
  <body>
    hoge!!
  </body>
</html>
```

```
 $ vi api/index.js
```

```javascript
return {hello: "world"};
```

Execute the msful command.

```
 $ msful
```

You can see something like this;

```javascript
## listen: 3333
```

# See execution result of msful

Open the browser and try accessing http://localhost:3333/
```
 hoge!!
```

Open the browser and try accessing http://localhost:3333/api/
```
 {"hello": "world"}
```

# option

- Specify the port as the first argument.

```
 msful 8080
```

```javascript
## listen: 8080
```


# WebAPI.

- Three pieces of information are available.

```
> params：   Parameter information such as PostData, json, Query.

> request：  http.createServer => request object.

> response： http.createServer => response object.

> headers： response Headers.

> httpError: function(status, message) => Call this to terminate processing with http error.
```

## example

```
 $ vi api/index.js
```

```javascript
value =  " hoge: [" + params.hoge + "]"
value += " method: [" + request.method + "]"
value += " url: [" + request.url + "]"

return {value: value}
```

http://localhost:3333/api/?hoge=abc

```
 {value: "hoge: hoge: [abc] method: [GET] url: [/api/?hoge=abc]"}
```

## example httpError function.

```
 $ vi api/index.js
```

```javascript
httpError(500, "test Error");

・・・・
```

http://localhost:3333/api/index

```
{error: 500, message: "test Error"}
```


## [Supplement] binary POST params.

At the time of binary transmission, `application/octet-stream` is set for the `Content-Type` of the header in response to the POST request.

- example

For ajax call, set `application / octet-stream` for HTTP header` Content-Type` at POST.

```javascript
fetch('http://localhost:3333/api/binaryUpload', {
  method: 'POST',
  body: binaryData,
  headers: {
    'Content-Type': 'application/octet-stream'
  }
}).
......
```


# commands

## project

- new project.

```
 $ mkdir example
 $ cd example
 $ msful project
 msful(micro service RESTFul API Server) v0.0.19
 Copyright(c) 2018 maachang.
 
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

or

```
 $ msful project example
 msful(micro service RESTFul API Server) v0.0.19
 Copyright(c) 2018 maachang.
 
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

```
 $ ls -la
drwxr-xr-x 1 root 197121 0 Apr 14 23:29 .
drwxr-xr-x 1 root 197121 0 Apr  8 17:27 ..
drwxr-xr-x 1 root 197121 0 Apr  5 18:38 api
drwxr-xr-x 1 root 197121 0 Apr 14 23:14 conf
drwxr-xr-x 1 root 197121 0 Apr  3 01:17 html
drwxr-xr-x 1 root 197121 0 Apr 14 23:29 lib
```

## help

- commands help.

```
 $ msful help
```

```
 msful [cmd]
  [cmd]
    project: Create a template for the new project.
    project [name]: Expand the project structure under the project name folder.
    help:    Display help information.
    [Number] Set the server bind port number.
    console: At the console, run JS on line.
    console [file]: Run the specified file on the console.
```

## console

- Execute file in interactive mode or file specification in the msful environment.

```
msful console
```

It is executed in interactive mode in the msful environment.

```
msful console [js-filename]
```

Execute JS of specified file in msful environment.


# configs

- config file

You can import the contents of the config file by creating a JSON format file under the conf folder.

For example, if you create a file called `./conf/hogehoge.conf` , the JSON format information of the file is expanded into a variable named `config.hogehoge` in msful, and you can use it.

- example

`./conf/dbInfo.conf`
```javascript
{
    name: "testDB",
    host: "localhost",
    port: 5432
}
```

We will implement the following API implementation.

`./api/dbInfo.js`
```javascript
return {
  "dbInfo-name": config.dbInfo.name,
  "dbInfo-host": config.dbInfo.host,
  "dbInfo-port": config.dbInfo.port
};
```

Please access `http://localhost:3333/api/dbInfo` and browse the terminal where msful is started.

```
{"dbInfo-name": "testDB", "dbInfo-host": "localhost", "dbInfo-port": "5432"}
```

# Basic module for msful

I will explain the necessary modules in micro service development.

## jwt

You can create `json-web-token`, acquire payload, check issue issuance.

### jwt.create(key, payload)

Generate JWT.

- key

Set the key for creating the token.

- payload

Sets the payload string of jwt.

- example

```javascript
jwt.create("hoge", "{a:100}");
```

```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0"
```

### jwt.payload(jwt)

Get payload information from jwt information.

- jwt

Set jwt information.

- example

```javascript
jwt.payload(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

```
{a:100}
```

### jwt.validate(key, jwt)

Confirm that the specified JWT information is the information generated with the specified key and the payload information etc. have not been changed.

- key

Set the key for creating the token.

- jwt

Set jwt information.

- example

```javascript
jwt.validate("hoge",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

```
true
```

```javascript
jwt.validate("moge",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

```
false
```

# strs

Utility for character string manipulation.

## strs.isNull(value)

Determines null and undefined.

- value.

Set the variable to be determined.

- example

```javascript
var a = null;
strs.isNull(a);
```

```
true
```

## strs.useString(value)

It checks whether the contents of the character string are valid.

Even if everything is a space, line feed, tab, etc., it is not recognized as character information.

- value

Set the variable to be determined.

- example

```javascript
var a = "aaaaa   ";
strs.useString(a);
```

```
true
```

```javascript
var a = "";
strs.useString(a);
```

```
false
```

```javascript
var a = "     ";
strs.useString(a);
```

```
false
```

## strs.changeString(base, src, dest)

Replace the src string in the base string with the dest string.

- base

Sets the original character string.

- src

Sets the character string to be converted.

- dest

Sets the replacement character for src.

- example

```javascript
var a = "abcdefabcdefabcdef";
strs.changeString(a,"abc","xyz");
```

```
"xyzdefxyzdefxyzdef"
```

# nums

Utility for numerical operation.

## nums.isNumeric(value)

It checks whether the specified argument is numeric.

- value

Set the variable to be determined.

- example

```javascript
var a = "100.123";
nums.isNumeric(a);
```

```
true
```

```javascript
var a = "100.123aa";
nums.isNumeric(a);
```

```
false
```

## nums.parseDecimal(mode, num, position)

Floating point is rounded off or truncated.

- mode

If set to true, round off.

- num

Sets the target floating point number.

- position

Sets the number of digits of rounding and truncation.

- example

```javascript
var a = "10.4567";
nums.parseDecimal(true, a, 2);
```

```
10.46
```

```javascript
var a = "10.4567";
nums.parseDecimal(false, a, 2);
```

```
10.45
```

# closeable

Api used when closing is done after the call is over.

※ However, it can not be used from Console.

## closeable.register(obj)

Register for closeable.

- obj

The target is an object type and must contain a close method inside. In addition, this close method is called after api is executed.

- example

```javascript
closeable.register({close:function(){ console.log("hoge"); }});
```

After executing the API with the above contents, the following will be displayed on the terminal.

```
hoge
```

## closeable.close()

Close all contents registered by register method.
However, this process does not usually need to be called, it is called immediately after api execution.

# validate

Validation processing of POST and GET parameters can be performed.

## validation.check

- arguments

You can exclude method limits and accesses other than specified methods as the first argument. In addition, the method limit can be omitted.
For subsequent arguments, define `parameter name`, `parameter type`, `processing content`, to perform validation.

- Setting definition explanation.

```
validate.check(method,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck
)
```

**method**:

 Set an accessible Http method. If omitted, all Http methods are allowed.

**paramName**:

 Set the target parameter name.

**dataType**:

 Set the data type for the target parameter name. The settings that can be set are as follows.

| typeName | Conversion contents |
|:---------|:--------------------|
| string | Convert to a string. |
| number | Convert to an integer. |
| float | Convert to an float. |
| bool | Convert to an boolean. |
| date | Convert to an DateObject. |
| list | Convert to an ArrayObject. |
| object | Convert to an object. |

The object and list type are specified when the contents of params are the same type.

**executeAndCheck**:

 You can check the existence, check the contents, and set the default value when no data exists.

| definition | example | example Description |
|:-----------|:--------|:--------------------|
| none | "none" |  I do not set anything. |
| required | "required" | Data existence check. |
| min num | "min 5" | Error when the number of characters is less than 5 characters. |
| max num | "max 5" | Error when the number of characters is 5 or more characters. |
| range min max | "range 5 12" | Error when the number of characters is 5 or less and 12 or more characters. |
| regex | "regex 'hoge'" | Error when /hoge/ does not match regex. |
| url | "url" | Error when not matching URL. |
| email | "email" | Error when not matching email. |
| date | "date" | Error if it does not match Date (yyyy-MM-dd). |
| time | "time" | Error if it does not match Time (HH:mm). |
| timestamp | "timestamp" | Error when format can not be converted with Date object. |
| default | "default 0" | Set the default value when data is not set. |
| rename | "rename 'abc'" | Change the parameter name to "abc". |

It is separated by a space.

This definition can be set consecutively with `|`.

**＜example＞**
```
"min 5 | max 12 | url"
```

- example

/api/exampleValidate.js
```javascript
validate.check("POST",
    "name",          "string", "req",
    "age",           "number", "default 18",
    "lat",           "float",  "default 0.0",
    "comment",       "string", "max 128",
    "X-Test-Code",   "string", "req"
);

return {value: JSON.stringify(params)};
```

**POST transmission processing.**
```javascript
fetch('http://localhost:3333/api/exampleValidate', {
  method: 'POST',
  body: JSON.stringify(sendParams),
  headers: {
    'Content-Type': 'application/json; charset=utf-8;',
    'X-Test-Code': 'test'
  }
}).
......
```

success params.
```javascript
var sendParams = {
  name: "maachang",
  age: 30,
  comment: "hogehoge",
}
```

**result**:
```
{"name": "maachang", "age": 30, "lat": 0.0, "comment": "hogehoge", "X-Test-Code": "test"}
```

**error params.**
```javascript
var sendParams = {
  age: 30,
  comment: "hogehoge",
}
```

**result**:
```
{status: 400, message: "Contents of 'name' are mandatory"}
```

# entity

 Formatting data in JSON format.

## entity.expose

 We will define JSON formatting.

Define to format the data in JSON format, and set the definition name as the first argument.
For the second and later arguments, set `parameter name`,` parameter type`, `processing content` for the definition.

- Setting definition explanation.

```
entity.expose(name,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck
)
```

**method**:

 Set an accessible Http method. If omitted, all Http methods are allowed.

**paramName**:

 Set the target parameter name.

**dataType**:

 Set the data type for the target parameter name. The settings that can be set are as follows.

| typeName | Conversion contents |
|:---------|:--------------------|
| string | Convert to a string. |
| number | Convert to an integer. |
| float | Convert to an float. |
| bool | Convert to an boolean. |
| date | Convert to an DateObject. |
| list | Convert to an ArrayObject. |
| object | Convert to an object. |
| $name | Set another entity.expose definition name. |
| { | Start indenting the object. |
| } | Finish indenting the object. |

The object and list type are specified when the contents of params are the same type.

I will explain `$name` based on example.

**＜example＞**
```javascript
entity.expose("user",
  "name",  "string",  "",
  "age",   "number",  "",
);
entity.expose("users",
  "list",  "$user",   ""
);

var res = {
  list: [
    {name: "maachang", age:18},
    {name: "saito",    age:21}
  ]
};

return entity.make("users", res);
```

**＜result＞**
```
{
  "list": [
    {"name": "maachang", "age": 18},
    {"name": "saito", "age": 21}
  ]
}
```

We will explain the indentation of `{` or `}` based on examples.

**＜example＞**
```javascript
entity.expose("user",
  "name",  "string",    "",
  "age",   "number",    "",
  "details": "{",       "",
  "nickName": "string", "",
  "comment": "string",  "",
  "details": "}",       ""
);

{
  name: "maachang",
  age:18,
  nickName: "hoge",
  comment: "mogemoge"
}

return entity.make("user", res);
```

**＜result＞**
```
{
  name: "maachang",
  age:18,
  details: {
    nickName: "hoge",
    comment: "mogemoge"
  }
}
```

**executeAndCheck**:

 You can check the existence, check the contents, and set the default value when no data exists.

| definition | example | example Description |
|:-----------|:--------|:--------------------|
| none | "none" |  I do not set anything. |
| required | "required" | Data existence check. |
| min num | "min 5" | Error when the number of characters is less than 5 characters. |
| max num | "max 5" | Error when the number of characters is 5 or more characters. |
| range min max | "range 5 12" | Error when the number of characters is 5 or less and 12 or more characters. |
| regex | "regex 'hoge'" | Error when /hoge/ does not match regex. |
| url | "url" | Error when not matching URL. |
| email | "email" | Error when not matching email. |
| date | "date" | Error if it does not match Date (yyyy-MM-dd). |
| time | "time" | Error if it does not match Time (HH:mm). |
| timestamp | "timestamp" | Error when format can not be converted with Date object. |
| default | "default 0" | Set the default value when data is not set. |
| rename | "rename 'abc'" | Change the parameter name to "abc". |

It is separated by a space.

This definition can be set consecutively with `|`.

**＜example＞**
```
"min 5 | max 12 | url"
```

## entity.make

We will perform JSON formatting.

- name

Set the definition name defined by entity.expose.

- value

Set the object to be shaped by JSON.

- example

```javascript
entity.expose("user",
  "name",  "string",    "",
  "age",   "number",    "",
  "details": "{",       "",
  "nickName": "string", "",
  "comment": "string",  "",
  "details": "}",       ""
);

{
  name: "maachang",
  age:18,
  nickName: "hoge",
  comment: "mogemoge"
}

return entity.make("user", res);
```

**result**:
```
{
  name: "maachang",
  age:18,
  details: {
    nickName: "hoge",
    comment: "mogemoge"
  }
}
```

