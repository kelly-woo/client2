/**
 * @fileoverview center 로딩 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('loadingCenter', loadingCenter);

  /**
   *
   * @example
   *
   */
  function loadingCenter(Browser) {
    return {
      restrict: 'EA',
      scope: {
        isShown: '=loadingCenter'
      },
      link: link,
      templateUrl: 'app/loading/loading.center.html'
    };

    function link(scope, el, attrs) {
      scope.browser = Browser;
      scope.loadingTextList = [
        'Loading',
        'Loading.',
        'Loading..',
        'Loading...'
      ];
    }
  }
})();
