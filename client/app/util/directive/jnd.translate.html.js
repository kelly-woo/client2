/**
 * @fileoverview scale up animation 을 수행하는 directive
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
