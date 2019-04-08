# msful basic function description

<p align = "center">
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/dt/msful.svg" alt = "Downloads"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/v/msful.svg" alt = "Version"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/l/msful.svg" alt = "License"> </a>
</ p>

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/docs/JP/next.md)

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README.md)

_

_

## How to use http related, request, response, params

```
 $ vi api/index.js
```

```javascript
value = "hoge: [" + params.hoge + "]"
value + = "method: [" + request.method + "]"
value + = "url: [" + request.url + "]"

rtx.send({value: value})
```

### Browse by browser

http:// localhost: 3333/api/?hoge = abc

###  Processing result

```
 {value: "hoge: hoge: [abc] method: [GET] url: [/api/? hoge = abc]"}
```

### Receive

The reception result is set to `params` as it is.

_

_

## Filter function

Start when the folder where you placed the folder is accessed.

The main usage is assumed to be used for common check processing, for example, functions such as access authentication.

To create a filter, create a file called `@filter.js` under the target folder.

If it is satisfied as a filter function, that is, you can call `rtx.next` if you can do the original calling process.

If it is not satisfied as a filter function, if you do not want to perform the original call processing, perform error processing with `new HttpError` or use the` rtx.redirect` method etc.

_

_

# config

If you create a file in JSON format under the `conf` folder, you can use the definition contents of JSON format in the program.

For example, if you create the file `/ conf/hogehoge.conf`, you can use it in the executable program with JSON-style variables called` config.hogehoge`.

### Usage example

`./conf/dbInfo.conf`
```javascript
{
    name: "testDB",
    host: "localhost",
    port: 5432
}
```

### Web API implementation using conf information

`./api/dbInfo.js`
```javascript
// Example.
rtx.send({
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

We will explain about reading conf file.

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

Extensions of mimeType can be supported by adding the following to conf/mime.js.

```javascript
// Set extended mimeType.
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

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README.md)