# Description for the msful base module.

<p align = "center">
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/dt/msful.svg" alt = "Downloads"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/v/msful.svg" alt = "Version"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/l/msful.svg" alt = "License"> </a>
</p>

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/docs/JP/base_mod.md)

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

_

_

Describes the Web API and the modules required for microservice development.

_

_

## jwt

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

##### method

Set the accessible Http method. If omitted, all Http methods are allowed.

##### paramName

Set the target parameter name.

##### dataType

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

##### executeAndCheck

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

```javascript
{
  "name": "maachang",
  "age": 30,
  "lat": 0.0,
  "comment": "hogehoge",
  "X-Test-Code": "test"}
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

##### name

 Set the definition name.

##### paramName

Set the target parameter name.

##### dataType

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

```javascript
// Example
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

```javascript
// Example.
{
  name: "maachang",
  age: 18,
  details: {
    nickName: "hoge",
    comment: "mogemoge"
  }
}
```

##### executeAndCheck

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

_

_

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README_JP.md)