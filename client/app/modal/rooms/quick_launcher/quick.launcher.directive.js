/**
 * @fileoverview quick launcher modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('quickLauncherModal', quickLauncherModal);

  function quickLauncherModal($filter, jndPubSub) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el) {
      var noMatchesMsg = $filter('translate')('@quick-launcher-no-matches');
      var noMatchesButtonMsg = $filter('translate')('@quick-launcher-create-topic-with-query');
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
        scope.$on('updateBadgePosition', _onUpdateBadgePosition);
      }

      /**
       * badge position update event handler
       * @private
       */
      function _onUpdateBadgePosition() {
        // badge position update시 left side api가 갱신 되어 있으므로 room list도 갱신한다.
        jndPubSub.pub('updateList:roomList');
      }

      /**
       * room name query change event handler
       * @param {string} value - filter 문자열
       * @private
       */
      function _onChangeRoomNameQuery(value) {
        if (scope.isEmptyMatches) {
          el.find('.quick-launcher-list').height(176);
          value = jqFilter.val();

          scope.noMatchesMsg = noMatchesMsg.replace('{{query}}', '<strong>' + value + '</strong>');
          value.length > 10 && (value = value.substring(0, 10) + '...');
          scope.noMatchesButtonMsg = '<i class="icon-plus"></i><span>' + noMatchesButtonMsg.replace('{{query}}', '<strong>' + value + '</strong>') + '</span>';
        }
      }
    }
  }
})();
