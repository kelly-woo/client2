/**
 * @fileoverview 초기화 로딩 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('loadingInitial', loadingInitial);

  /**
   *
   * @example
   *
   */
  function loadingInitial(Browser) {
    return {
      restrict: 'E',
      link: link,
      templateUrl: 'app/util/directive/loading/initial/loading-initial.html'
    };

    function link(scope, el, attrs) {
      scope.isIE = Browser.msie;
      scope.$on('publicService:hideInitialLoading', _hide);

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
