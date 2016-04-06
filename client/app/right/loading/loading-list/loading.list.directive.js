/**
 * @fileoverview loading list dicrective
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('rightLoadingList', rightLoadingList);
  
  function rightLoadingList() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        isScrollLoading: '=',
        isEndOfList: '='
      },
      templateUrl : 'app/right/loading/loading-list/loading.list.html',
      link: angular.noop
    };
  }
})();
