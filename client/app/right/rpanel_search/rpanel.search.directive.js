(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rPanelSearch', rPanelSearch);

  function rPanelSearch() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      replace: true,

      templateUrl : 'app/right/rpanel_search/rpanel.search.html',
      controller: 'rPanelSearchCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();