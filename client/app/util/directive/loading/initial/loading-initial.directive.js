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
  function loadingInitial($timeout, Browser) {
    return {
      restrict: 'E',
      replace: true,
      link: link,
      templateUrl: 'app/util/directive/loading/initial/loading-initial.html'
    };

    function link(scope, el, attrs) {
      scope.isIE = Browser.msie;
      scope.$on('publicService:hideInitialLoading', _hide);
      $timeout(function() {
        el.addClass('fade in');
      }, 10);
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
