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
        el.html(el.html().replace(/({{)(.*)(}})/g, function(str, brace1, content, brace2) {
          return '\\{\\{' + content + '\\}\\}';
        }));
        return link;
      }
      function link(scope, el, attr) {
        el.html(el.html().replace(/(\\{\\{)(.*)(\\}\\})/g, function(str, brace1, content, brace2) {
          return '{{' + content + '}}';
        }));
      }
    }
})();
