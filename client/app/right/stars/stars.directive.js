/**
 * @fileoverview stars directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightStars', rightStars);

  function rightStars() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        status: '='
      },
      templateUrl : 'app/right/stars/stars.html',
      controller: 'RightStarsCtrl',
      link: angular.noop
    };
  }
})();
