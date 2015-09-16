/**
 * @fileoverview compile 시 {{}} syntax 를 무시하는 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndIgnoreBraces', jndIgnoreBraces);

    function jndIgnoreBraces() {
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
        if (el.html().indexOf('{{') !== -1) {
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
        if (el.html().indexOf('{{') !== -1) {
          el.html(_unescape(el.html()));
        }
      }
      function _escape(str) {
        str = str || '';
        return str.replace(/({{)(.*)(}})/g, function(str, brace1, content, brace2) {
          return '\\{\\{' + content + '\\}\\}';
        });
      }
      function _unescape(str) {
        str = str || '';
        return str.replace(/(\\{\\{)(.*)(\\}\\})/g, function(str, brace1, content, brace2) {
          return '{{' + content + '}}';
        });
      }
    }
})();
