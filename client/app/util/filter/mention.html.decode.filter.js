/**
 * @fileoverview HtmlEntity 로 변환된 mention 태그만 html 문자열로 디코드 한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('mentionHtmlDecode', mentionHtmlDecode);

  function mentionHtmlDecode($filter) {
    return function(text) {
      return decode(text);
    };

    function decode(text) {
      var decodeFilter = $filter('htmlDecode');
      text = text || '';
      return text.replace(/\&lt\;(\w+)\smention\-view\=.+\/\1\&gt;/g, function(m0) {
        return decodeFilter(m0);
      });
    }
  }
})();
