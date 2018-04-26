// 型チェック・変換、validateなどチェック処理系.
// この処理はindex.jsなどでrequire処理はしない.
//

module.exports = (function(_g) {
"use strict";
var strs = require("../strs");
var nums = require("../nums");
var o = {}

// タイプコード.
o.typeCode = {
  "string": 1,
  "number": 2,
  "float": 3,
  "boolean": 4,
  "date": 5,
  "list": 6,
  "object": 7
};

// 型判別.
o.types = function(n) {
  n = (""+n).toLowerCase();
  switch(n) {
    case "string" : return 1;
    case "text" : return 1;
    case "number": return 2;
    case "num": return 2;
    case "int": return 2;
    case "integer": return 2;
    case "long": return 2;
    case "float": return 3;
    case "double": return 3;
    case "boolean": return 4;
    case "bool": return 4;
    case "flag": return 4;
    case "date": return 5;
    case "datetime": return 5;
    case "timestamp": return 5;
    case "list": return 6;
    case "array": return 6;
    case "map": return 7;
    case "json": return 7;
    case "object": return 7;
    case "{": return -10;
    case "}": return -11;
    case "[": return -20;
    case "]": return -21;
  }
  if(n.indexOf("$") == 0) {
    return -1;
  }
  return 1;
}

// 型変換.
o.convert = function(type, value, entityFlg) {
  entityFlg = (entityFlg == true);
  if(value == null || value == undefined) {
    return null;
  }
  switch(type|0) {
    case 1: return ""+value;
    case 2: if(nums.isNumeric(value)) {
              return parseInt(value);
            }
            return null;
    case 3: if(nums.isNumeric(value)) {
              return +value;
            }
            return null;
    case 4: if(value == true || value == "true" || value == "on") {
              return true;
            } else if(value == false || value == "false" || value == "off") {
              return false;
            }
            return null;
    case 5: if(value instanceof Date) {
              return entityFlg ? value.toUTCString() : value;
            }
            var d = new Date(value);
            if(isNaN(d.getTime())) {
              return null;
            }
            return entityFlg ? d.toUTCString() : d;
    case 6: return (value instanceof Array) ? value : null;
    case 7: return (typeof(value) == "object") ? value : null;
  }
  throw new Error("Type conversion failed:" + type + " value:" + value);
}

// データ処理メソッドを作成.
o.dataCalls = function(f) {
  if(typeof(f) == "function") {
    return f;
  }
  var exLst = [];
  var lst = cutEmpty(strs.cutString(f,"|"));
  if(lst.length == 0) {
    return validates.none;
  }
  var len = lst.length;
  for(var i = 0; i < len; i ++) {
    exLst.push(calls(lst[i].trim(), f));
    lst[i] = null;
  }
  lst = null; f = null;
  return function(name, type, value) {
    var ret = null;
    var r = null;
    var len = exLst.length;
    for(var i = 0 ; i < len; i ++) {
      if((r = exLst[i](name, type, value)) != null) {
        ret = r;
      }
    }
    return ret;
  }
}

// １つのcallsを処理.
var calls = function(f, name) {
  var lst = cutEmpty(strs.cutString(f," "));
  var len = lst.length;
  if(len == 0) {
    return validates.none;
  }
  var arg1,arg2,ret;
  switch(lst[0].toLowerCase()) {
    case "default":
    case "def":
      arg1 = lst[1]; lst = null;
      ret = validates.createDefault(arg1);
      arg1 = null;
      return ret;
    case "req":
    case "required":
      lst = null;
      ret = validates.createRequired();
      return ret;
    case "min":
      arg1 = lst[1]; lst = null;
      ret = validates.createMin(arg1);
      arg1 = null;
      return ret;
    case "max":
      arg1 = lst[1]; lst = null;
      ret = validates.createMax(arg1);
      arg1 = null;
      return ret;
    case "minmax":
    case "range":
      arg1 = lst[1]; arg2 = lst[2]; lst = null;
      ret = validates.createRange(arg1, arg2);
      arg1 = null; arg2 = null;
      return ret;
    case "regex":
      arg1 = lst[1]; lst = null;
      ret = validates.createRegex(arg1);
      arg1 = null;
      return ret;
    case "url":
      lst = null;
      ret = validates.createUrl();
      return ret;
    case "email":
      lst = null;
      ret = validates.createEmail();
      return ret;
    case "date":
      lst = null;
      ret = validates.createDate();
      return ret;
    case "time":
      lst = null;
      ret = validates.createTime();
      return ret;
    case "timestamp":
    case "datetime":
      lst = null;
      ret = validates.createTimestamp();
      return ret;
    
  }
  throw new Error("Type validation failed '" + name + "' :" + f);
}

// リストの空文字を削除.
var cutEmpty = function(lst) {
  var n;
  var ret = [];
  var len = lst.length;
  for(var i = 0; i < len; i ++) {
    n = lst[i];
    if(n.length == 0) {
      continue;
    }
    ret.push(n);
    n = null;
  }
  return ret;
}

// コーテーションカット.
var cutCote = function(n) {
  return ((n[0] == "\"" && n[n.length-1] == "\"") ||
    (n[0] == "\'" && n[n.length-1] == "\'")) ?
    n.substring(1,n.length-1) : n;
}

// 正規表現.
var r_url = new RegExp("https?://[\\w/:%#\\$&\\?\\(\\)~\\.=\\+\\-]+");
var r_email = new RegExp("\\w{1,}[@][\\w\\-]{1,}([.]([\\w\\-]{1,})){1,3}$");
var r_date = new RegExp("^\\d{2,4}\\/([1][0-2]|[0][1-9]|[1-9])\\/([3][0-1]|[1-2][0-9]|[0][1-9]|[1-9])$");
var r_time = new RegExp("^([0-1][0-9]|[2][0-3]|[0-9])\\:([0-5][0-9]|[0-9])$");

//######################################
// validate処理.
//######################################
var validates = {}

//-------------------------------------
// validation無し.
//-------------------------------------
validates.none = function(name, type, value) {
  return null;
}

//-------------------------------------
// デフォルト処理.
//-------------------------------------
validates.createDefault = function(arg1) {
  var v1 = arg1; arg1 = null;
  if(v1 == undefined || v1 == null) {
    v1 = null;
  }
  return function(name, type, value) {
    if(value == null || value == undefined) {
      if(v1 != null) {
        return o.convert(type, cutCote(v1));
      } else {
        // 空のデフォルト値.
        switch(type) {
          case 1: return "";
          case 2: return 0;
          case 3: return 0.0;
          case 4: return false;
          case 5: return new Date(0);
          case 6: return [];
          case 7: return {};
          default: null;
        }
      }
    }
    return value;
  };
}

//-------------------------------------
// 存在チェック.
//-------------------------------------
validates.required = function(n) {
  return n != null && n != undefined;
}
validates.req = validates.required;

// error.
validates.requiredError = function(name) {
  throw {status: 400, message: "Contents of '" + name + "' are mandatory"}
}

// create.
validates.createRequired = function() {
  return function(name, type, value) {
    if(!validates.required(value)) {
      validates.requiredError(name);
    }
    return null;
  };
}

//-------------------------------------
// 最小チェック.
//-------------------------------------
validates.min = function(n, t, len) {
  len = len|0;
  switch(t) {
    case 1: return validates.req(n) && (""+n).length >= len;
    case 2: case 3: return validates.req(n) && n >= len;
  }
  return false;
}

// error.
validates.minError = function(name,v1) {
  throw {status: 400, message: "The length of '" + name + "' must be " + v1 +" or more"};
}

// create.
validates.createMin = function(arg1) {
  var v1 = arg1; arg1 = null;
  return function(name, type, value) {
    if(!validates.min(value, type, cutCote(v1))) {
      validates.minError(name,v1);
    }
    return null;
  }
}

//-------------------------------------
// 最大チェック.
//-------------------------------------
validates.max = function(n, t, len) {
  len = len|0;
  switch(t) {
    case 1: return validates.req(n) && (""+n).length <= len;
    case 2: case 3: return validates.req(n) && n <= len;
  }
  return false;
}

// error.
validates.maxError = function(name,v1) {
  throw {status: 400, message: "The length of '" + name + "' must be less than or equal to " + v1};
}

// create.
validates.createMax = function(arg1) {
  var v1 = arg1; arg1 = null;
  return function(name, type, value) {
    if(!validates.max(value, type, cutCote(v1))) {
      validates.maxError(name,v1);
    }
    return null;
  }
}

//-------------------------------------
// 範囲チェック.
//-------------------------------------
validates.range = function(n, t, s, e) {
  s = s|0;
  e = e|0;
  if(validates.req(n)) {
    if(t == 1) {
      n = (""+n).length;
    } else if(t != 2 && t != 3) {
      return false;
    }
    return n >= s && n <= e;
  }
  return false;
}

// error.
validates.rangeError = function(name,v1,v2) {
  throw {status: 400, message: "The length of '" + name + "' must be " + v2 + " or more and " + v1 + " or less"};
}

// create.
validates.createRange = function(arg1,arg2) {
  var v1,v2;
  v1 = arg1; arg1 = null;
  v2 = arg2; arg2 = null;
  return function(name, type, value) {
    if(!validates.range(value, type, cutCote(v1), cutCote(v2))) {
      validates.rangeError(name,v1,v2);
    }
    return null;
  };
}

//-------------------------------------
// 正規表現チェック.
//-------------------------------------
validates.regex = function(n, t, x) {
  if(!(x instanceof RegExp)) {
    x = new RegExp(""+x);
  }
  if(t == 1) {
    return validates.req(n) && (x.test(""+n));
  }
  return false;
}

// error.
validates.regexError = function(name,v1) {
  throw {status: 400, message: "The content of '" + name + "' does not match the condition"};
}

// create.
validates.createRegex = function(arg1) {
  var v1 = arg1; arg1 = null;
  return function(name, type, value) {
    if(!validates.regex(value, type, cutCote(v1))) {
      validates.regexError(name,v1);
    }
    return null;
  };
}

//-------------------------------------
// URLチェック.
//-------------------------------------
validates.url = function(n, t) {
  return validates.regex(n, t, r_url);
}

// error.
validates.urlError = function(name) {
  throw {status: 400, message: "The content of '" + name + "' does not match the condition of url."};
}

// create.
validates.createUrl = function() {
  return function(name, type, value) {
    if(!validates.url(value, type)) {
      validates.urlError(name);
    }
    return null;
  };
}

//-------------------------------------
// emailチェック.
//-------------------------------------
validates.email = function(n, t) {
  return validates.regex(n, t, r_email);
}

// error.
validates.emailError = function(name) {
  throw {status: 400, message: "The content of '" + name + "' does not match the condition of email."};
}

// create.
validates.createEmail = function() {
  return function(name, type, value) {
    if(!validates.email(value, type)) {
      validates.emailError(name);
    }
    return null;
  };
}

//-------------------------------------
// 日付チェック.
//-------------------------------------
validates.date = function(n, t) {
  return validates.regex(n, t, r_date);
}

// error.
validates.dateError = function(name) {
  throw {status: 400, message: "The content of '" + name + "' does not match the condition of date."};
}

// create.
validates.createDate = function() {
  return function(name, type, value) {
    if(!validates.date(value, type)) {
      validates.dateError(name);
    }
    return null;
  };
}

//-------------------------------------
// 時間チェック.
//-------------------------------------
validates.time = function(n, t) {
  return validates.regex(n, t, r_time);
}

// error.
validates.timeError = function(name) {
  throw {status: 400, message: "The content of '" + name + "' does not match the condition of time."};
}

// create.
validates.createTime = function() {
  return function(name, type, value) {
    if(!validates.time(value, type)) {
      validates.timeError(name);
    }
    return null;
  };
}

//-------------------------------------
// タイムスタンプチェック.
//-------------------------------------
validates.timestamp = function(n, t) {
  if(t != o.typeCode.date) {
    return !isNaN(new Date(n));
  }
  return true;
}

// error.
validates.timestampError = function(name) {
  throw {status: 400, message: "The content of '" + name + "' does not match the condition of timestamp."};
}

// create.
validates.createTimestamp = function() {
  return function(name, type, value) {
    if(!validates.timestamp(value, type)) {
      validates.timestampError(name);
    }
    return null;
  }
}

return o;
})(global);
