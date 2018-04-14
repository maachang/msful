// シンプルなJWT(HS256のみ対応)
//

module.exports = (function (_g) {
  var crypto = require('crypto');
  
  // base64の[=]をカット.
  var _cutEq = function (n) {
    var p = n.indexOf("=");
    if (p != -1) {
      return n.substring(0, p);
    }
    return n;
  }
  
  // base64.
  var _base64 = function (n) {
    return _cutEq(new Buffer(n, "UTF8").toString("base64"));
  }
  
  // hs256符号化処理.
  var _signature = function (key, payload) {
    return _cutEq(crypto.createHmac("sha256", key).update(payload).digest("base64"));
  }
  
  var o = {};
  
  // JWT生成.
  o.create = function (key, payload) {
    var payload = _base64('{"alg":"HS256","typ":"JWT"}') + "." +
      _base64(typeof(payload) != "string" ? JSON.stringify(payload) : payload);
    return payload + "." + _signature(key, payload);
  }
  
  // ペイロード取得.
  o.payload = function(jwtString) {
    var p = jwtString.indexOf(".");
    if(p == -1) {
      return null;
    }
    var pp = jwtString.indexOf(".",p + 1);
    if(pp == -1) {
      return null;
    }
    return JSON.parse(new Buffer(jwtString.substring(p + 1, pp), "base64").toString());
  }
  
  // JWTが正しいかチェック処理.
  o.validate = function (key, jwtString) {
    try {
      var p = jwtString.lastIndexOf(".");
      return _signature(key, jwtString.substring(0, p)) == jwtString.substring(p + 1);
    } catch (e) {
      return false;
    }
  }
  
  return o;
})(global)
