(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightSearch', rightSearch);

  function rightSearch($filter, Dialog, jndKeyCode) {
    return {
      restrict: 'E',
      scope: {
        keyword: '=',
        onEnter: '&',
        onResetQuery: '&'
      },
      link: link,
      replace: true,
      templateUrl : 'app/right/search/search.html',
      controller: 'RightSearchCtrl'
    };

    function link(scope, el) {
      var _translate = $filter('translate');
      var _jqSearchBox = el.find('.rpanel-body-search__input');
      var _jqInitButton = el.find('.rpanel-search-init');

      _init();

      function _init() {
        _attachDomEvents();
        _attachScopeEvents();
      }

      function _attachDomEvents() {
        _jqSearchBox.on('keyup', _onKeyDown);
        _jqInitButton.on('click', _onClick);
      }

      function _attachScopeEvents() {
        scope.$on('rPanelSearchFocus', _onSearchFocus);
      }

      /**
       * key down event handler
       * @param {object} event
       * @private
       */
      function _onKeyDown(event) {
        var target = event.target;
        var which = event.which;
        var value = target.value;

        if (jndKeyCode.match('ENTER', which)) {
          if (_validSearchKeyword(value)) {
            scope.onEnter({
              $keyword: value
            });
          } else {
            Dialog.warning({
              title: _translate('@search-minimum-query-length')
            });
          }
        }
      }

      function _onClick() {
        scope.onResetQuery();
      }

      function _onSearchFocus() {
        _jqSearchBox.focus();
      }

      function _validSearchKeyword(keyword) {
        return keyword.length !== 1;
      }
    }
  }
})();
