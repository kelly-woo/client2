/**
 * @fileoverview topic connector directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('connectPlug', connectPlug);

  /* @ngInject */
  function connectPlug(EntityMapManager, memberService) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        data: '=jndDataModel',
        onStatusChange: '&',
        onSetting: '&',
        onDelete: '&'
      },
      templateUrl : 'app/center/view_components/entity_header/room-connector/connect-plug/connect.plug.html',
      link: link
    };

    function link(scope) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.connectId = scope.data.connectId;
        scope.memberId = scope.data.memberId;
        scope.botId = scope.data.botId;
        scope.status = scope.data.status;
        scope.unionName = scope.data.unionName;

        scope.isActive = scope.status === 'enabled';

        scope.isConnector = _isConnector();
        scope.isAllowUpdate = scope.isConnector || _isAdmin();

        scope.onServiceToggle = onServiceToggle;
        scope.onSettingClick = onSettingClick;
        scope.onDeleteClick = onDeleteClick;

        _setContent();

      }

      /**
       * set content
       * @private
       */
      function _setContent() {
        var member = EntityMapManager.get('member', scope.memberId) || {};
        var bot = EntityMapManager.get('bot', scope.botId) || {};

        scope.memberName = member.name || 'unknown';
        scope.botProfileImage = bot.thumbnailUrl || 'https://assets.jandi.com/images/profile_80.png';
        scope.botName = bot.name || 'unknown';
      }

      /**
       * service toggle handler
       * @param $value
       */
      function onServiceToggle(value) {
        scope.onStatusChange({
          $connectId: scope.connectId,
          $status: value
        });
      }

      /**
       * setting handler
       * @param event
       */
      function onSettingClick(event) {
        event.stopPropagation();

        scope.onSetting({
          $connectId: scope.connectId,
          $unionName: scope.unionName
        });
      }

      /**
       * delete handler
       * @param {object} event
       */
      function onDeleteClick(value) {
        if (value) {
          scope.onDelete({
            $connetId: scope.connectId,
            $value: value
          });
        }
      }

      /**
       * connect를 생성한 connector 여부
       * @private
       */
      function _isConnector() {
        return memberService.getMemberId() === scope.memberId;
      }

      /**
       * admin 여부
       * @returns {*}
       * @private
       */
      function _isAdmin() {
        return memberService.isAdmin();
      }
    }
  }
})();
