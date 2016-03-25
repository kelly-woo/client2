(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightSearch', rightSearch);

  function rightSearch($filter, jndKeyCode, Dialog) {
    return {
      restrict: 'E',
      scope: {
        keyword: '='
      },
      link: link,
      replace: true,
      templateUrl : 'app/right/search/search.html',
      controller: 'RightSearchCtrl'
    };

    function link(scope, el) {
      var _translate = $filter('translate');
      var _jqSearchBox = el.find('#right-panel-search-box');

      _init();

      function _init() {
        _attachDomEvents();
      }

      function _attachDomEvents() {
        _jqSearchBox.on('keyup', _onKeyDown);
      }

      /**
       * key down event handler
       * @param {object} event
       * @private
       */
      function _onKeyDown(event) {
        var target = event.target;
        var which = event.which;

        if (jndKeyCode.match('ENTER', which) && target.value.length === 1) {
          Dialog.warning({
            title: _translate('@search-minimum-query-length')
          });
        }
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
    }
  }
})();
