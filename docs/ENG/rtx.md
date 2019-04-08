# Description for rtx (Response Context)

<p align = "center">
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/dt/msful.svg" alt = "Downloads"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/v/msful.svg" alt = "Version"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/l/msful.svg" alt = "License"> </a>
</p>

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/docs/JP/rtx.md)

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README.md)

_

_

rtx is provided as a processing group that performs HTTP response processing.

```javascript

rtx.send ({hello: "world"})
```

By doing this, for the response, mimeType is `application/json; charset = utf-8;` and {hello: "world"} is returned as body information.

As such, rtx is mainly used when you want to return an HTTP response.

_

_

## rtx.send = function (body, status)
```
 Set the JSON data to be returned.

  body: Set the JSON to be returned.

  status: Sets the status to be returned.
```

```javascript
//Example
rtx.send ({hello: "world"}, 200);

> With HTTP status 200, mimeType is `application/json; charset = utf-8;`
  {hello: "world"} will be returned as body information.
```

_

_

## rtx.binary = function (body, status, charset)
```
 Set the binary data to be returned.

  body: Sets the binary data to be returned.
         If set string, convert to binary according to charset.

  status: Sets the status to be returned.

  charset: Specify the character code. If not specified, it is utf-8.
            This information makes sense when body = string.
```

```javascript
//Example
rtx.binary (new Buffer ([0xe3, 0x81, 0x82]), 200);

> Send 'A' UTF8 data in binary.

rtx.binary ("Oh", 200, "utf-8");

> Send 'A' UTF8 data in binary.

headers ['Content-Type'] = "image/gif";
rtx.binary (new Buffer ([0x00, 0x01, 0x02 ....]), 200);

> A sample of binary transmission with mimeType set.

```
_

_

## rtx.redirect = function (url, status)
```
 Set the redirect destination.

  url: Set the URL of redirect destination.

  status: Sets the status to be returned.
           This usually does not need to be set.
```

```javascript
//Example
rtx.redirect ("https://www.yahoo.co.jp/");

> Redirected to specified URL.
```

_

_

## rtx.error = function (status, message, e)
```
 Error message will be returned.

  status: Sets the error status.

  message: Sets an error message.

  e: Set exception information.
```

```javascript
//Example
rtx.error (500, "an error occurred");

> With http error 500, mimeType is `application/json; charset = utf-8;`
  body information is {result: "error", error: 500, message: "an error occurred"}
  Will be returned.
```

_

_

## rtx.status = function (status)
```
 Set the return status.

  status: Sets the error status.
```

```javascript
//Example
rtx.status (status);

> Give priority to the return status.
  In other words, this value is used when the status is not set.
```

_

_

## rtx.isSendScript = function ()
```
 If you want to process rtx.send, rtx.binary, rtx.error, rtx.redirect etc., true is returned.
```

```javascript
//Example
rtx.isSendScript ();

> If it has already been sent, true will be returned.

//Before sending.
console.log ("[Before sending] rtx.isSendScript ():" + rtx.isSendScript ())

rtx.send ({hello: "world"}, 200);

//After sending.
console.log ("[after sending] rtx.isSendScript ():" + rtx.isSendScript ())

//Processing result.
> [Before sending] rtx.isSendScript (): false
> [After sending] rtx.isSendScript (): true
```

_

_

## rtx.isErrorSendScript = function ()
```
 If you want to do rtx.error processing, true is returned.
```

```javascript
//Example
rtx.isErrorSendScript ();

> If an error has already been sent, true will be returned.

//Before sending.
console.log ("[before sending error" rtx.isErrorSendScript (): "+ rtx.isSendScript ())

rtx.error (500, "error");

//After sending.
console.log ("[After sending error" rtx.isErrorSendScript (): "+ rtx.isSendScript ())

//Processing result.
> [Before sending] rtx.isErrorSendScript (): false
> [After sending] rtx.isErrorSendScript (): true
```

_

_

## About rtx. $.
```javascript
//Example
return rtx. $ ()
  .then (function (rtx) {
    rtx.send ({
      message: "Success"
    });
  })
  .catch (e) {
    throw e;
  }
```

```
Description:
 promise will be returned.
 Finally, as mentioned above, returning the result of promise will reflect the processing result.
 Also, the information of [rtx (ResponseContext)] is set to the first argument of function (rtc) for the first then.
 Also, exceptions etc. are passed by catch (e).
```

_

_

## rtx.push = function (call)
```
 Insert a script to execute with rtx.next ().
```

```javascript
//Example
rtx.push (function () {
  var a = 100;
})

//Example.
rtx.push ("./hoge/moge");

> The above process is executed when calling rtx.next ().

Also, if you set the first argument as a string, the specified script will not be loaded.

This process call is mainly used when you want to interrupt another process, such as filter process.

```

_

_

## rtx.size = function ()
```
 Get an executable number with rtx.next ().
```

```javascript
//Example
rtx.size ()

> Get an executable number with rtx.next ().
```

_

_

## rtx.next = function ()
```
 Execute the script set in rtx.push.
 In most cases, if there is @ filter.js, the original process is pushed, @ filter.js is executed, and rtx.next () is called internally.
```

```javascript
//Example
rtx.next ()
 
> Execute the process set in rtx.push.
```

_

_

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README.md)