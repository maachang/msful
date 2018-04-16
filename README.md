# msful is Web API server for micro service

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

## useage

Install.
```
 $ npm install -g msful
```


Create a folder and go to that folder.

```
 $ mkdir myFolder
 $ cd myFolder
```

Create a project for msful.

```
 $ msful project
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

## See execution result of msful

Open the browser and try accessing http://localhost:3333/
```
 hoge!!
```

Open the browser and try accessing http://localhost:3333/api/
```
 {"hello": "world"}
```

## option

- Specify the port as the first argument.

```
 msful 8080
```

```javascript
## listen: 8080
```


## WebAPI.

- Three pieces of information are available.

```
> params：   Parameter information such as PostData, json, Query.

> request：  http.createServer => request object.

> response： http.createServer => response object.

> headers： response Headers.
```

### example

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

### [Supplement] binary POST params.

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


## commands

### project

- new project.

```
 $ mkdir example
 $ cd example
 $ msful project
 new project!! version: v0.0.16
  [html]directory.
    It stores static files (HTML, JS, CSS, Images) here.
  [api]directory
    Here, we store RESTFul API programs implemented by JS.
  [lib]directory
    This is a folder for storing JS libraries.
  [conf]directory
    This is a folder for storing configuration information in JSON format.
 
 $ ls -la
```

```
drwxr-xr-x 1 root 197121 0 Apr 14 23:29 .
drwxr-xr-x 1 root 197121 0 Apr  8 17:27 ..
drwxr-xr-x 1 root 197121 0 Apr  5 18:38 api
drwxr-xr-x 1 root 197121 0 Apr 14 23:14 conf
drwxr-xr-x 1 root 197121 0 Apr  3 01:17 html
drwxr-xr-x 1 root 197121 0 Apr 14 23:29 lib
```

### help

- commands help.

```
msful help
```

```
msful [cmd]
 [cmd]
   project: Create a template for the new project.
   help:    Display help information.
   [Number] Set the server bind port number.
   console: At the console, run JS on line.
   console [file]: Run the specified file on the console.
```

### console

- Execute file in interactive mode or file specification in the msful environment.

```
msful console
```

It is executed in interactive mode in the msful environment.

```
msful console [js-filename]
```

Execute JS of specified file in msful environment.


## configs

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
console.log("dbInfo-name: " + config.dbInfo.name);
console.log("dbInfo-host: " + config.dbInfo.host);
console.log("dbInfo-port: " + config.dbInfo.port);
```

Please access `http://localhost:3333/api/dbInfo` and browse the terminal where msful is started.
```
dbInfo-name: testDB
dbInfo-host: localhost
dbInfo-port: 5432
```

## Basic module for msful

- msful modules.

### jwt

You can create `json-web-token`, acquire payload, check issue issuance.

#### jwt.create(key, payload)

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

#### jwt.payload(jwt)

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

#### jwt.validate(key, jwt)

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

## strs

Utility for character string manipulation.

### strs.isNull(value)

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

### strs.useString(value)

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

### strs.startsWith(value,chk)

Check if chk character matches the beginning of value.

- value

Set the variable to be determined.

- chk

A string to check if it matches the first character of value.

- example

```javascript
var a = "abcdefg";
strs.startsWith(a,"abc");
```

```
true
```


### strs.endsWith(value,chk)

Check if chk character matches the end of value.

- value

Set the variable to be determined.

- chk

A string to check if it matches the last character of value.

- example

```javascript
var a = "abcdefg";
strs.endsWith(a,"efg");
```

```
true
```

### strs.changeString(base, src, dest)

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

## nums

Utility for numerical operation.

### nums.isNumeric(value)

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

### nums.parseDecimal(mode, num, position)

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

### nums.halfUp(num, position)

We will round off.

- num

Sets the target floating point number.

- position

Set the number of digits.

- example

```javascript
var a = "10.4567";
nums.halfUp(a, 2);
```

```
10.46
```

### nums.halfDown(num, position)

We will truncate.

- num

Sets the target floating point number.

- position

Set the number of digits.

- example

```javascript
var a = "10.4567";
nums.halfDown(a, 2);
```

```
10.45
```

### nums.floor(num)

Round down the nearest decimal point.

- num

Sets the target floating point number.

- example

```javascript
var a = "10.6789";
nums.floor(a);
```

```
10
```

### nums.round(num)

Round up the nearest decimal point.

- num

Sets the target floating point number.

- example

```javascript
var a = "10.6789";
nums.round(a);
```

```
11
```

## nums.abs(num)

Calculate the absolute value.

- num

Set numeric information.

- example

```javascript
var a = "10";
nums.round(a);
```

```
10
```

```javascript
var a = "-10";
nums.round(a);
```

```
10
```

