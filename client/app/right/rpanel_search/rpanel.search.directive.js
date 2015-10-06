(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rPanelSearch', rPanelSearch);

  function rPanelSearch($timeout) {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      replace: true,

      templateUrl : 'app/right/rpanel_search/rpanel.search.html',
      controller: 'rPanelSearchCtrl'
    };

    function link(scope, element) {
      var timerSearch;

      element
        .find('#right-panel-search-box')
        .on('keyup', function() {
          var target = this;

          $timeout.cancel(timerSearch);
          timerSearch = $timeout(function() {
            var value = target.value;
            if (value === '' || value.length > 1) {
              scope.onFileTitleQueryEnter(value);
            }
          }, 500);
        });

      element.on('$destroy', function() {
          $timeout.cancel(timerSearch);
        });
    }
  }
})();