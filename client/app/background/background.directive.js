/**
 * @fileoverview 기본 로딩 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('background', background);

  /**
   *
   * @example
   *
   */
  function background(Browser) {
    return {
      restrict: 'E',
      link: link,
      templateUrl: 'app/background/background.html'
    };

    function link(scope, el, attrs) {
      scope.isIE = Browser.msie;

      scope.$on('showDefaultBackground', _show);
      scope.$on('hideDefaultBackground', _hide);

      /**
       * loading 을 show 한다
       * @private
       */
      function _show() {
        el.show();
      }

      /**
       * loading 을 hide 한다
       * @private
       */
      function _hide() {
        el.hide();
      }
    }
  }
})();
