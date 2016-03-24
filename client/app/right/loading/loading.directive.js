/**
 * @fileoverview right panel loading directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightLoading', rightLoading);

  function rightLoading() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/right/loading/loading.html',
      link: angular.noop
    };
  }
})();
