(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightSearch', rightSearch);

  function rightSearch($timeout, $filter, jndKeyCode, Dialog) {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      replace: true,
      templateUrl : 'app/right/search/search.html',
      controller: 'RightSearchCtrl'
    };

    function link(scope, element) {
      var timerSearch;

      $('#right-panel-search-box')
        .on('keyup', _onKeyDown)
        .on('$destroy', _onDestroy);


      $('#right-panel-search-select-all')
        .on('change',_doSearch);

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
        timerSearch = $timeout(_doSearch, 500);
      }

      /**
       * 검색 이벤트를 trigger 한다
       * @private
       */
      function _doSearch() {
        var value = $('#right-panel-search-box').val();
        if (value === '' || value.length > 1) {
          scope.onFileTitleQueryEnter(value);
        }
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
