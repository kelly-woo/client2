/**
 * @fileoverview loading keyword search dicrective
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('rightLoadingKeywordSearch', rightLoadingKeywordSearch);
  
  function rightLoadingKeywordSearch() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        searchStatus: '='
      },
      templateUrl : 'app/right/loading/loading-keyword-search/loading.keyword.search.html',
      link: angular.noop
    };
  }
})();
