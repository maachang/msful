# About library embedding

<p align = "center">
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/dt/msful.svg" alt = "Downloads"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/v/msful.svg" alt = "Version"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/l/msful.svg" alt = "License"> </a>
</p>

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/docs/JP/built_in.md)

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README.md)

_

_

In msful, `msful project` is created when you create a project, so` startup.js`?

## startup.js

Edit this content to perform initialization processing and library installation.

startup.js
```javascript
// Write a script that will be executed at msful startup.
//
//

// _g : Global variable.
// conf : Configuration definition is set.
// envName: The execution environment name is set.
// consoleFlag: "true" when running in console mode.
// serverId: The server ID is set.
'use strict';

// Set the initial condition to `users`.
const users = {};



return users;
```

By defining the library you want to include for `counst users`, that library will be available for use with? msful.

First, we will explain how to implement `mongodb` as an example.

_

_

### Install mongodb client

If this is not installed, first install the mongodb client with command execution.

```cmd

$ npm install mongodb

```

_

_

### Incorporate mongodb

Initialize the mongodb client installed earlier, set it in the users object, and embed it.

./conf/mongodb.json

```json
{
  "url": "mongodb://127.0.0.1:27017/myDB"
}
```

./startup.js
```javascript
// Write a script that will be executed at msful startup.
//
//

// _g : Global variable.
// conf : Configuration definition is set.
// envName: The execution environment name is set.
// consoleFlag: "true" when running in console mode.
// serverId: The server ID is set.
'use strict';

// Set the initial condition to `users`.
const users = {};

// mongodb.
(function() {
  try {
    const mongoClient = require('mongodb').MongoClient
    var db = null;

    // mongodb connection.
    mongoClient.connect(conf.mongodb.url, function(err, mongodb) {
      if(err) {
        console.error("connect error mongodb", err);
        mongodb.close();
        process.exit(1);
      } else {
        db = mongodb;
      }
    })

    // Get mongodb's collection.
    var mongo = function( name ) {
      return db.collection( name );
    }

    // Register mongodb as users.
    users.mongo = mongo;
  } catch(e) {
    console.error("error mongodb", e);
    process.exit(1)
  }
})();

return users;

```

_

_

### Using mongodb

Actually use mongodb with webApi.

_

_

#### Save data.

./api/userInfo/save.js
```javascript

// validate.
validate("POST"
  ,"name",  "string", "req"
  ,"age",   "number", ""
  ,"sex",   "number", "default 3"
);

// Load mongodb created in "startup.js".
const mongo = users.mongo;
const COL = "userInfo";

// Save parameters to mongodb.
return mongo(COL).insertOne(params).then(function(r) {
  // Return processing result.
  rtx.send(r);
});

```

_

_

#### Get data.

./api/userInfo/find.js
```javascript
const ObjectID = require('mongodb').ObjectID;

// validate.
validate("GET"
  ,"id",  "number", "req"
);

// Load mongodb created in "startup.js".
const mongo = users.mongo;
const COL = "userInfo";

// Read data from mongodb.
mongo(COL).findOne({
    _id: new ObjectID(params.id)
  }, {}, function(err, r){
  if(err) {
    // Return exception.
    rtx.exception(err);
  } else {
    // Return processing result.
    rtx.send(r);
  }
});

```
_

_

#### Delete data

./api/userInfo/remove.js
```javascript
const ObjectID = require('mongodb').ObjectID;

// validate.
validate("GET"
  ,"id",  "number", "req"
);

// Load mongodb created in "startup.js".
const mongo = users.mongo;
const COL = "userInfo";

// Delete data from mongodb.
mongo(COL).findOneAndDelete({
    _id: new ObjectID(params.id)
  }, {}, function(err, r){
  if(err) {
    // Return exception.
    rtx.exception(err);
  } else {
    // Return processing result.
    rtx.send(r);
  }
});

```

In this way, you can set up a library etc. initialized to users.

_

_

# Built-in logger

msful has a simple logger built in.

This is fine as far as development and the system log of msful itself, but if you want to use a extractor logger such as `log4js` instead of a simple logger, you can change it here.

Also, since msful log output is registered under the name `system`, you can change the msful system log by overwriting this name.

_

_

## Built-in method.

Install log4js.

```cmd
$ npm install log4js
```

_

_

### Describe the definition of log4js.

./conf/log4js.json

```json
{
  "appenders" : {
    "system" : {"type": "file", "filename": "./log/system.log"}
  },
  "categories" : {
    "default" : {"appenders" : ["system"], "level" : "debug"},
  }
}
```

### Include in startup.js.

startup.js
```javascript
// Write a script that will be executed at msful startup.
//
//

// _g : Global variable.
// conf : Configuration definition is set.
// envName: The execution environment name is set.
// consoleFlag: "true" when running in console mode.
// serverId: The server ID is set.
'use strict';

// Get log4js logger.
const log4js = require('log4js')

// Configure log4js settings.
log4js.configure(conf.log4js);

// Get msful logger.
var logger = msfulLogger();

// Add log4js "system" logger.
logger.setup("system", log4js.getLogger("system"));

// Set the initial condition to `users`.
const users = {};



return users;
```

## How to use logger.

./api/index.js

```javascript

// Load msful's logger.
const logger = msfulLogger();

// Load log4js "system" logger.
const log = logger.get("system");

// Output log.
log.info("access /api/index.js");

// http response return.
Rtx.send({"result": "success"})
```

The msful `system` logger is now replaced by log4js.