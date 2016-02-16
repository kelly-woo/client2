/**
 * @fileoverview translate 와 동일한 역할을 하는 directive
 *
 * 차이점:
 * translate)
 *  Test <b>bold</b> test
 *  => <span>Test</span> <b>bold</b> <span>test</span>
 *
 * jnd-html-translate)
 * Test <b>bold</b> test
 *  => Test <b>bold</b> test
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndHtmlTranslate', jndHtmlTranslate);

  function jndHtmlTranslate($filter) {
    return {
      restrict: 'A',
      scope: {},
      link: link
    };

    function link(scope, el, attrs) {
      el.html($filter('translate')(el.text()));
    }
  }
})();
