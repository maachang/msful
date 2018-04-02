msful is Web API server for micro service;

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

## useage

Install.

> $ npm install -g msful


Create a folder and go to that folder.

> $ mkdir myFolder
> $ cd myFolder

Create content placement folder.

> $ mkdir html

Create WebApi placement folder.

> $ mkdir api

Place a static file in the html folder and place a javascript file that generates RESTful in the api folder.

> $ vi html/index.html
```html
＜html＞＜head＞＜/head＞＜body＞hoge!!＜/body＞＜/html＞
```

> $ vi api/index.js
```javascript
return {hello: "world"};
```

Execute the msful command.

> $ msful

You can see something like this;

```javascript
## listen: 3333
```

## See execution result of msful

Open the browser and try accessing http://localhost:3333/
> hoge!!

Open the browser and try accessing http://localhost:3333/api/
> {"hello": "world"}


## option

- Specify the port as the first argument.
> msful 8080


## WebAPI.

- Three pieces of information are available.

> `params`：   Parameter information such as PostData, json, Query.

> `request`：  http.createServer:request object.

> `response`： http.createServer:response object.

- example

> $ vi api/index.js

```javascript
value =  " hoge: [" + params.hoge + "]"
value += " method: [" + request.method + "]"
value += " url: [" + request.url + "]"

return {value: value}
```

http://localhost:3333/api/?hoge=abc

> {value: "hoge: hoge: [abc] method: [GET] url: [/api/?hoge=abc]"}

- binary POST params.

At the time of binary transmission, `application/octet-stream` is set for the `Content-Type` of the header in response to the POST request.
