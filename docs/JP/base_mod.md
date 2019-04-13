# msful基本モジュールに対する説明.

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

English documents [here](https://github.com/maachang/msful/blob/master/docs/ENG/base_mod.md)

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

_

_

WebAPIと、マイクロサービス開発に必要なモジュールについて説明します.

_

_

## jwt

JWT `json-web-token` を使ってログインの認証などで利用します。

_

_

### jwt.create = function(key, payload)

JWTを生成します.

#### key

トークンを作成するためのキーを設定します。

#### payload

ペイロード文字列を設定します。

#### 使用例

```javascript
jwt.create("hoge", "{a:100}");
```

#### 処理結果

```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0"
```

### jwt.payload = function(jwt)

jwt情報からペイロード情報を取得します。

#### jwt

JWT情報を設定します.

#### 使用例

```javascript
jwt.payload(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

#### 処理結果

```
{a:100}
```

_

_

### jwt.validate = function(key, jwt)

指定されたJWT情報が指定されたキーで生成された情報であり、ペイロード情報などが変更されていないことを確認します。

### key

トークンを作成するためのキーを設定します。

#### jwt

jwt情報を設定します。

#### 使用例(成功)

```javascript
jwt.validate("hoge",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

#### 処理結果

```
true
```

#### 使用例(失敗)

```javascript
jwt.validate("moge",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2E6MTAwfQ.lKzDfCDW/AbAFq639ZoT0t2RrBmGGsBKo7WUck8ZTi0");
```

#### 処理結果

```
false
```

_

_

# uniqueId

ユニークなIDを生成します.

## uniqueId.init = function(seet)

乱数の初期化を行います.

別に設定しない場合でも、１度はnanoTimeで初期化されています.

#### seet

seet に乱数の初期値を設定します.

設定しない場合は、実行時のnanoTimeを設定します.

#### 使用例

```javascript
uniqueId.init();
```

上記内容では、ユニークIDを生成する乱数の初期値としてnanoTimeが割り当てられます.

_

_

## uniqueId.getUUID = function()

ユニークなIDをuuid形式で取得します.

#### 使用例

```javascript
uniqueId.getUUID();
```

ユニークなuuidが返却されます.

```
0318ad30-2a2f-e5ac-17a6-1b291a04b377
```

_

_

## uniqueId.getId = function(size)

ユニークな数値のIDを桁数を指定して取得します.

#### size

ユニークな数値のIDを桁数指定します。
別に１００桁とかでも、作成することが可能です.

#### 使用例

```javascript
uniqueId.getId(50);
```

ユニークな数値のIDが５０文字で返却されます。

```
14874527252142404651747822974182554844614290061441
```

_

_

## uniqueId.code64 = function(value), uniqueId.decode64 = function(value)

uniqueId.getIdで生成した数値の情報を短縮化します。

#### value

code64の場合は、uniqueId.getIdで生成した数値の情報を入れます。

decode64の場合は、uniqueId.code64で生成した短縮情報を設定します。


#### 使用例

```javascript
var a = uniqueId.getId(50);
var b = uniqueId.code64(a);
var c = uniqueId.decode64(b);

console.log("uniqueId.getId(50):  " + a);
console.log("uniqueId.code64(a):  " + b);
console.log("uniqueId.decode64(b):" + c);

```

code64の場合は、uniqueId.getIdで生成した数値の情報を短縮文字変換します。

decode64の場合は、uniqueId.code64で生成した短縮情報を元のuniqueId.getId情報に戻します。

```
uniqueId.getId(50):  13622729598424657310232258591765575149207946539313
uniqueId.code64(a):  WedSYjfELNw+ntr8YsYVrzMuVivc
uniqueId.decode64(b):13622729598424657310232258591765575149207946539313
```

_

_

# closable

処理終了後に、確実にクローズ処理を実行したい処理を行う場合に利用します。

※ただし、コンソールからは使用できません。

## closable.register = function(obj)

closeableにクローズ処理を行う処理を登録します.

#### obj

ターゲットはオブジェクト型であり、内部にcloseメソッドを含める必要があります。

#### 使用例

```javascript
closable.register({close:function(){ console.log("hoge"); }});
```

上記の内容のAPIを実行すると、msfulを起動しているターミナルに次のようなメッセージが表示されます。

```
hoge
```

_

_

## closable.close = function()

登録メソッドによって登録されたすべてのコンテンツを閉じます。
ただし、このプロセスは通常は呼び出す必要はなく、apiの実行直後に自動的に呼び出されます。

_

_

# validate

POSTおよびGETパラメータの検証処理を実行します。

ここで言うパラメータとは `params` の内容を指します.

また、default 設定で存在しない場合のデフォルト値を設定したり、rename 設定でパラメータ名を変更することが可能です.

_

_

## validation

- 引数説明

```
validate(method,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck
)
```

**method**:

アクセス可能なHttpメソッドを設定します。 省略すると、すべてのHttpメソッドが許可されます。

**paramName**:

ターゲットパラメータ名を設定します。

**dataType**:

ターゲットパラメータ名のデータ型を設定します。 設定できる項目は次のとおりです。

| タイプ名 | 説明 |
|:---------|:--------------------|
| string | 文字列に変換します |
| number | 整数に変換します |
| float | 浮動小数点に変換します |
| bool | BOOLEAN型に変換します |
| date | 日付オブジェクトに変換します |
| list | Arrayオブジェクトに変換します |
| object | オブジェクトに変換します |

`object` と `list` の型は、paramsの内容が同じ型のときに指定されます。

**executeAndCheck**:

`paramName` に対する状態を確認、変更するための条件設定です。

| 定義名 | 設定例 | 設定例説明 |
|:-----------|:--------|:--------------------|
| none | "none" | 何もしません |
| required | "required" | データが空の場合エラー |
| min num | "min 5" | ５より小さい(String.length < 5 or Number < 5)場合エラー |
| max num | "max 5" | ５より大きい(String.length > 5 or Number > 5)場合エラー |
| range min max | "range 5 12" | ５以上１２以下の場合エラー |
| regex | "regex 'hoge'" | `hoge` と言う文字が存在しない場合エラー |
| url | "url" | URL形式で無い場合エラー |
| email | "email" | email形式で無い場合エラー |
| date | "date" | `yyyy-MM-dd` 形式で無い場合エラー |
| time | "time" | `HH:mm` 形式で無い場合エラー |
| timestamp | "timestamp" | DateオブジェクトでNaNになる場合エラー |
| default | "default 0" | データが空の場合0をセットする |
| rename | "rename 'abc'" | パラメータ名を `abc` にリネームする |

この定義は `|`で連続して設定できます。

**＜例＞**
```
"min 5 | max 12 | url"
```

#### validate設定例

/api/exampleValidate.js
```javascript
validate("POST",
    "name",          "string", "req",
    "age",           "number", "default 18",
    "lat",           "float",  "default 0.0",
    "comment",       "string", "max 128",
    "X-Test-Code",   "string", "req"
);

return {value: JSON.stringify(params)};
```

#### Ajaxでアクセスするための実装内容.

```javascript
fetch('http://localhost:3333/api/exampleValidate', {
  method: 'POST',
  body: JSON.stringify(sendParams),
  headers: {
    'Content-Type': 'application/json; charset=utf-8;',
    'X-Test-Code': 'test'
  }
}).
```

#### Ajaxでの送信データ内容(正常).

```javascript
var sendParams = {
  name: "maachang",
  age: 30,
  comment: "hogehoge",
}
```

#### 処理結果

```
{"name": "maachang", "age": 30, "lat": 0.0, "comment": "hogehoge", "X-Test-Code": "test"}
```

#### Ajaxでの送信データ内容（エラー）.

```javascript
var sendParams = {
  age: 30,
  comment: "hogehoge",
}
```

#### 処理結果

```
{result: "error", status: 400, message: "Contents of 'name' are mandatory"}
```

_

_

# entity

JSON形式のデータの書式設定を定義します。

利用想定としては、たとえばデータベースから多くの列を持つデータを取得したが、返却条件はそれほど多くない場合は自前で変換プログラムを実装したりするのは面倒であると言えます。
それに、JSでは型がないことから、受信側が数値で受け取ることを考慮しているプログラムを実装しているが、こちら側の返却では文字列なっていてエラーになるなど、これらを一々変換処理を入れたりするのも、面倒でメンテナンス的にも問題となるでしょう。

entityは、それらの面倒な問題を払拭するために利用します。

_

_

## entity.expose

JSONの書式を定義します。

データをJSON形式でフォーマットし、定義名を最初の引数として設定することを定義します。
2番目以降の引数については、 `parameter name`、` parameter type`、 `processing content`を定義します。

#### 定義説明

```
entity.expose(name,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck,
    paramName, dataType, executeAndCheck
)
```

**name**:

 定義名を設定します.

**paramName**:

ターゲットパラメータ名を設定します。

**dataType**:

ターゲットパラメータ名のデータ型を設定します。 設定できる項目は次のとおりです。

| タイプ名 | 説明 |
|:---------|:--------------------|
| string | 文字列に変換します |
| number | 整数に変換します |
| float | 浮動小数点に変換します |
| bool | BOOLEAN型に変換します |
| date | 日付オブジェクトに変換します |
| list | Arrayオブジェクトに変換します |
| object | オブジェクトに変換します |
| $name | 別のentity.expose定義名を設定し、新しいインデントを作成します。 |
| { | オブジェクトのインデントを開始します。 |
| } | オブジェクトのインデントを終了します。 |

`object` と `list` の型は、paramsの内容が同じ型のときに指定されます。

`$name` タイプは、以下のように利用します.

**＜例＞**
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

**＜結果＞**
```javascript
{
  "list": [
    {"name": "maachang", "age": 18},
    {"name": "saito", "age": 21}
  ]
}
```

 `{`や `}` のタイプは、以下のように利用します.

**＜例＞**
```javascript
entity.expose("user",
  "name",  "string",    "",
  "age",   "number",    "",
  "details": "{",       "",
  "nickName": "string", "",
  "comment": "string",  "",
  "details": "}",       ""
);

var res = {
  name: "maachang",
  age:18,
  nickName: "hoge",
  comment: "mogemoge"
}

return entity.make("user", res);
```

**＜結果＞**
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

`paramName` に対する状態を確認、変更するための条件設定です。

| 定義名 | 設定例 | 設定例説明 |
|:-----------|:--------|:--------------------|
| none | "none" | 何もしません |
| required | "required" | データが空の場合エラー |
| min num | "min 5" | ５より小さい(String.length < 5 or Number < 5)場合エラー |
| max num | "max 5" | ５より大きい(String.length > 5 or Number > 5)場合エラー |
| range min max | "range 5 12" | ５以上１２以下の場合エラー |
| regex | "regex 'hoge'" | `hoge` と言う文字が存在しない場合エラー |
| url | "url" | URL形式で無い場合エラー |
| email | "email" | email形式で無い場合エラー |
| date | "date" | `yyyy-MM-dd` 形式で無い場合エラー |
| time | "time" | `HH:mm` 形式で無い場合エラー |
| timestamp | "timestamp" | DateオブジェクトでNaNになる場合エラー |
| default | "default 0" | データが空の場合0をセットする |
| rename | "rename 'abc'" | パラメータ名を `abc` にリネームする |

この定義は `|`で連続して設定できます。

**＜例＞**
```
"min 5 | max 12 | url"
```

## entity.make

`entity.expose` で作成した定義に対して、対象のJSONをチェック、変換します.

#### name

`entity.expose` で作成した定義名を設定します.

#### value

変換対象のJSON情報を設定します.

#### 使用例

```javascript
entity.expose("user",
  "name",  "string",    "",
  "age",   "number",    "",
  "details": "{",       "",
  "nickName": "string", "",
  "comment": "string",  "",
  "details": "}",       ""
);

var res = {
  name: "maachang",
  age:18,
  nickName: "hoge",
  comment: "mogemoge"
}

return entity.make("user", res);
```

#### 処理結果

```javascript
{
  name: "maachang",
  age:18,
  details: {
    nickName: "hoge",
    comment: "mogemoge"
  }
}
```

_

_

readme.mdのドキュメントに戻る [readme](https://github.com/maachang/msful/blob/master/README_JP.md)