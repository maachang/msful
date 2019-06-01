# Tutorial.

<p align = "center">
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/dt/msful.svg" alt = "Downloads"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/v/msful.svg" alt = "Version"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/l/msful.svg" alt = "License"> </a>
</p>

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/docs/JP/tutorial.md)

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README.md)

_

_

I think that it is very difficult to understand if only the specifications and usage of msful are simply explained, so I will write a simple tutorial.

As a flow, I would like to describe the minimum necessary conditions for creation.

## Perform "Define for development environment".

Define for development environment with -e and --env at the time of invocation at the time of msful command.

If you do not define anything, it is [development], so you should use this.

_

_

## Prepare the conf file.

By placing a file in JSON format under the conf folder, for example, when [hoge.json] is omitted from the file name extension, [config.hoge] is linked to the config object as JSON information.

Define the definition information used in the system here.

In addition, when this "definition for development environment" is performed, the contents can be "switched" and information can be acquired.

For example, if you define "Development", "Staging", "Production", etc. in "Environment definition",

```
Development: development
staging: staging
Production: production
```

If you do, those conf definitions are

```
[conf]
 |
 +-[development]
 | |
 | +-JSON file for development
 +-[staging]
 | |
 | +-JSON file for staging
 +-[production]
    |
    +-Production JSON file
```

These can be obtained from the [envConf] object by defining

Please refer to [Configuration explanation](https://github.com/maachang/msful/blob/master/docs/ENG/next.md#config) file function for a description of this area.

_

_

## Perform api implementation

The api implementation can do the following:

### Use promise by rtx.$.

```javascript
//Example
return rtx.$().
  then(function(value) {
//In case of normal system.
    rtx.send({
      message: "Success"
    });

//in case of error
    throw new HttpError(500, "Error");
  })
```

When making a promise, use an error handler such as `throw new HttpError` when an error occurs.

### Asynchronous use by async.

```javascript
//Example
(async function() {
//In case of normal system.
  rtx.send({
    message: "Success"
  });

//in case of error.
  rtx.error(500, "error");
})();
```

### Return on synchronous execution.

```javascript
//Example
//In case of normal system.
rtx.send({
  message: "Success"
});

//in case of error.
rtx.error(500, "error");
```

If data is not sent finally by asynchronous execution, processing will be waited until the HTTP timeout, so care must be taken to ensure that it is sent.

Please refer to [rtx](https://github.com/maachang/msful/blob/master/docs/ENG/rtx.md) for how to use rtx.

In addition, usage such as [request] and [response] can be used as the node standard module.

_

_

## Specific functions of msful

msful specific functions jwt, closable, validate, entity Please check the following contents.

[jwt](https://github.com/maachang/msful/blob/master/docs/ENG/base_mod.md#jwt)

[uniqueId](https://github.com/maachang/msful/blob/master/docs/ENG/base_mod.md#uniqueId)

[closeable](https://github.com/maachang/msful/blob/master/docs/ENG/base_mod.md#closeable)

[validate](https://github.com/maachang/msful/blob/master/docs/ENG/base_mod.md#validate)

[entity](https://github.com/maachang/msful/blob/master/docs/ENG/base_mod.md#entity)

[phttpc](https://github.com/maachang/msful/blob/master/docs/ENG/base_mod.md#phttpc)

_

_

## Implementation and usage of common processing.

If you define common process and implement it, it is better to implement the script of require target under the lib folder.

```
[lib]
 |
 +-users.js user common processing system.
```

If you want to use this, you can use [require] as follows.

```javascript

var users = require("lib/users");
```

_

_

## filter function.

Common execution processing of script on the same folder of api can be defined by filter function.

For example, assuming that the process under the folder always performs "user write authentication", the process for checking it is defined as "@ filter.js" and is called in the common process when executing the api script under the folder.

### User write permission check process.

Take a sample as an example.

```
[api]
 |
 +-[user]
       |
       +-@ filter.js Filter to check if you have user write permission.
       |
       +-create.js Process to create and write a user.
       |
       +-update.js Update and write user process.
       |
       +-delete.js Process to delete user.
```

```javascript
//@ filter.js
var users = require("lib/users");

if(users.isSignature(request, "user")) {
  return rtx.next();
} else {
  throw new HttpError(500, "No write permission");
}
```

Here, for user creation, update, and deletion, common processing that enables only trusted communication with write authority is performed by filter processing.

When user creation, update, deletion is executed, first [@filter.js] is executed, and if it is normal, [rtx.next()] will make the actual user creation, update, deletion process work. .

_

_

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README.md)