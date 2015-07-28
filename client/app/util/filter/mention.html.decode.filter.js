/**
 * @fileoverview 사용자가 입력한 text를 수정하여 center chat에 출력함.
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
      return text.replace(/\&lt\;a mention\-view\=.+\/a\&gt;/g, function(m0) {
        return decodeFilter(m0);
      });
    }
  }
})();
