/**
 * @fileoverview loading search progress dicrective
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('loadingSearchResult', loadingSearchResult);
  
  function loadingSearchResult() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        searchStatus: '='
      },
      templateUrl : 'app/right/loading/loading-search-result/loading.search.result.html',
      link: angular.noop
    };
  }
})();
