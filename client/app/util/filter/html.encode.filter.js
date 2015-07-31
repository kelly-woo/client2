/**
 * @fileoverview 사용자가 입력한 text를 수정하여 center chat에 출력함.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('htmlEncode', htmlEncode);

  function htmlEncode() {
    var entities = {
      '"': 'quot',
      '&': 'amp',
      '<': 'lt',
      '>': 'gt',
      '\'': '#39'
    };

    return function(text) {
      return encode(text);
    };

    /**
     * encode 한다.
     * @param {String} text - html 문자열
     * @returns {String}
     */
    function encode(text) {
      text = text || '';
      return text.replace(/[<>&"']/g, function(m0) {
        return entities[m0] ? '&' + entities[m0] + ';' : m0;
      });
    }
  }
})();
