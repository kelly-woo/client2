/**
 * @fileoverview 사용자가 입력한 text를 수정하여 center chat에 출력함.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('htmlDecode', htmlDecode);

  function htmlDecode() {
    var entities = {
      '&quot;': '"',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&#39;': '\'',
      '&nbsp;' : ' '
    };

    return function(text) {
      return decode(text);
    };

    /**
     * Html entity 문자열을 치환하여 반환한다.
     * @param {String} text - html entity 로 변환된 문자열
     * @returns {String}
     */
    function decode(text) {
      text = text || '';
      return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, function(m0) {
        return entities[m0] ? entities[m0] : m0;
      });
    }
  }
})();
