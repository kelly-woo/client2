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
      restrict: 'EA',
      replace: true,
      scope: true,
      link: link,
      templateUrl : 'app/right/stars/stars.html',
      controller: 'RightStarsCtrl'
    };

    function link(scope, el, attrs) {
    }
  }
})();
