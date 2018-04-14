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

Create content placement folder.

```
 $ mkdir html
```

Create WebApi placement folder.

```
 $ mkdir api
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


## commands

### project

- new project.

```
 $ mkdir example
 $ cd example
 $ msful project
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
```

## configs

- config file

You can import the contents of the config file by creating a JSON format file under the conf folder.

For example, if you create a file called `./conf/hogehoge.conf` , the JSON format information of the file is expanded into a variable named `hogehoge` in msful, and you can use it.


## Basic module for msful

- msful modules.

### jwt

You can create `json-web-token`, acquire payload, check issue issuance.

#### create(key, payload)

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

#### payload(jwt)

Get payload information from jwt information.

- jwt

Set jwt information.

- example

```javascript
jwt.payload("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

```
{a:100}
```

#### validate(key, jwt)

Confirm that the specified JWT information is the information generated with the specified key and the payload information etc. have not been changed.

- key

Set the key for creating the token.

- jwt

Set jwt information.

- example

```javascript
jwt.validate("hoge", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

```
true
```

```javascript
jwt.validate("moge", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

```
false
```


