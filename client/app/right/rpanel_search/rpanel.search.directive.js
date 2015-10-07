(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rPanelSearch', rPanelSearch);

  function rPanelSearch($timeout, $filter, jndKeyCode, Dialog) {
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
        .on('keyup', _onKeyDown)
        .on('$destroy', _onDestroy);

        /**
       * key down event handler
       * @param {object} event
       * @private
       */
      function _onKeyDown(event) {
        var target = this;
        var which = event.which;

        if (jndKeyCode.match('ENTER', which) && target.value.length === 1) {
          Dialog.warning({
            title: $filter('translate')('@search-minimum-query-length')
          });
        }

        $timeout.cancel(timerSearch);
        timerSearch = $timeout(function() {
          var value = target.value;
          if (value === '' || value.length > 1) {
            scope.onFileTitleQueryEnter(value);
          }
        }, 500);
      }

      /**
       * element destroy event handler
       * @private
       */
      function _onDestroy() {
        $timeout.cancel(timerSearch);
      }
    }
  }
})();
