/**
 * @fileoverview right panel loading directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightPanelLoading', rightPanelLoading);

  function rightPanelLoading() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/right/loading/right.panel.loading.html',
      link: angular.noop
    };
  }
})();
