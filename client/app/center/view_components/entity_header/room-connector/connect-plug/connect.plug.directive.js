/**
 * @fileoverview topic connector directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('connectPlug', connectPlug);

  /* @ngInject */
  function connectPlug(EntityMapManager, jndPubSub, JndUtil) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        connectId: '=',
        memberId: '=',
        botId: '=',
        status: '='
      },
      templateUrl : 'app/center/view_components/entity_header/room-connector/connect-plug/connect.plug.html',
      link: link
    };

    function link(scope, el) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.member = EntityMapManager.get('member', scope.memberId);
        scope.bot = EntityMapManager.get('bot', scope.botId);

        scope.isActive = scope.status === 'enabled';
        scope.onServiceToggle = onServiceToggle;

        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        el.find('.connect-delete')
          .on('click', onConnectDeleteClick)
      }

      function onServiceToggle($value) {
        scope.isActive = !$value;
      }

      function onConnectDeleteClick(event) {
        event.stopPropagation();
        JndUtil.safeApply(scope, function() {
          jndPubSub.pub('connectPlug:connectDelete', scope.connectId);
        });
      }
    }
  }
})();
