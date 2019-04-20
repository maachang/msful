// ユーティリティ関連.
//

module.exports = (function (_g) {
  'use strict';

  var o = {};
  
  // スタック.
  o.stack = function() {
    var object = {} ;
    object._value = null ;
    object._last = null ;
    object._len = 0 ;
    object.clear = function() {
      object._value = null ;
      object._last = null ;
      object._len = 0 ;
    }
    object.top = function( v ) {
      if( object._value == null ) {
        object._value = [v,null] ;
        object._last = object._value ;
      }
      else {
        object._value = [v,object._value] ;
      }
      object._len ++ ;
    }
    object.push = function( v ) {
      if( object._value == null ) {
        object._value = [v,null] ;
        object._last = object._value ;
      }
      else {
        var o = [v,null] ;
        object._last[1] = o ;
        object._last = o ;
      }
      object._len ++ ;
    }
    object.pop = function() {
      if( object._value == null ) {
        return null ;
      }
      var o = object._value[0] ;
      object._value = object._value[1] ;
      if( object._value == null ) {
        object._last = null ;
      }
      object._len -- ;
      return o ;
    }
    object.peek = function() {
      if( object._value == null ) {
        return null ;
      }
      return object._value[0] ;
    }
    object.size = function() {
      return object._len ;
    }
    return object ;
  }
  
  return o;
})(global)
