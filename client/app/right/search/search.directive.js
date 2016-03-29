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
        isFocus: '=?',
        onChange: '&',
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

      var _timerKeywordChange;

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
        scope.$watch('keyword', _onKeywordChange);
        scope.$watch('isFocus', _onFocus);
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
            scope.onChange({
              $keyword: value
            });
          } else {
            Dialog.warning({
              title: _translate('@search-minimum-query-length')
            });
          }
        }
      }

      function _validSearchKeyword(keyword) {
        return keyword.length !== 1;
      }

      function _onClick() {
        scope.onResetQuery();
      }

      function _onKeywordChange(value) {
        clearTimeout(_timerKeywordChange);
        _timerKeywordChange = setTimeout(function() {
          scope.onChange({
            $keyword: value
          });
        }, 500);
      }

      function _onFocus(isFocus) {
        if (isFocus === true) {
          _jqSearchBox.focus();
        }

        scope.isFocus = false;
      }
    }
  }
})();
