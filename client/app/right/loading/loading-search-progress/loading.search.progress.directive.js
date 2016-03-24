/**
 * @fileoverview loading search progress dicrective
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('loadingSearchProgress', loadingSearchProgress);
  
  function loadingSearchProgress() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        searchStatus: '='
      },
      templateUrl : 'app/right/loading/loading-search-progress/loading.search.progress.html',
      link: angular.noop
    };
  }
})();
