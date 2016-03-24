/**
 * @fileoverview end of list dicrective
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('rightEndOfList', rightEndOfList);
  
  function rightEndOfList() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl : 'app/right/end-of-list/end.of.list.html',
      link: angular.noop
    };
  }
})();
