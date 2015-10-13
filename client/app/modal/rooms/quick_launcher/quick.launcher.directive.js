/**
 * @fileoverview quick launcher modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('quickLauncherModal', quickLauncherModal);

  function quickLauncherModal() {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el) {
      var jqFilter = el.find('#quick-launcher-filter');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        setTimeout(function () {
          jqFilter.focus();
        }, 50);

        _on();
      }

      /**
       * on listeners
       * @private
       */
      function _on() {
        scope.$watch('roomNameQuery', _onChangeRoomNameQuery);
      }

      function _onChangeRoomNameQuery(value) {
        if (scope.isEmptyMatches) {
          value = jqFilter.val();

          scope.emptyMatchesMsg = '<strong>' + value + '</strong>에 대한 검색 결과가 없습니다.';
          value.length > 10 && (value = value.substring(0, 10) + '...');
          scope.emptyMatchesButtonText = '<strong>' + value + '</strong>라는 이름의 새로운 토픽을 생성하기';
        }
      }
    }
  }
})();
