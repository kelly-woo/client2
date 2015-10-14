/**
 * @fileoverview compile 시 { } syntax 를 무시하는 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndIgnoreBraces', jndIgnoreBraces);

    function jndIgnoreBraces() {
      var regxEscape = /({)|(})/g;
      var escapeMap = {
        '{': '\\{',
        '}': '\\}'
      };

      var regxUnescape = /(\\{)|(\\})/g;
      var unescapeMap = {
        '\\{': '{',
        '\\}': '}'
      };

      return {
        restrict: 'A',
        compile: compile
      };

      function compile(el, attr) {
        _.each(attr, function(value, key) {
          if (key.indexOf('$') === -1){
            attr[key] = _escape(value);
          }
        });
        if (el.html().indexOf('{') !== -1) {
          el.html(_escape(el.html()));
        }
        return link;
      }

      function link(scope, el, attr) {
        _.each(attr, function(value, key) {
          if (key.indexOf('$') === -1){
            attr[key] = _unescape(value);
          }
        });
        if (el.html().indexOf('\\{') !== -1) {
          el.html(_unescape(el.html()));
        }
      }

      /**
       * brace 를 escape 한다
       * @param {string} str - brace 문자열
       * @returns {string} - escape 처리된 문자열
       * @private
       */
      function _escape(str) {
        str = str || '';
        return str.replace(regxEscape, function (match) {
          return escapeMap[match];
        });
      }

      /**
       * brace 를 unescape 한다
       * @param {string} str
       * @returns {string}
       * @private
       */
      function _unescape(str) {
        str = str || '';
        return str.replace(regxUnescape, function(match) {
          return unescapeMap[match];
        });
      }
    }
})();
