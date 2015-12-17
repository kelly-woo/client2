/**
 * @fileoverview topic connector directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('connectPlug', connectPlug);

  /* @ngInject */
  function connectPlug(EntityMapManager) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        connectId: '=',
        memberId: '=',
        botId: '=',
        status: '=',
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
        //botType: "connect_bot"
        //id: 11345541
        //isStarred: false
        //name: "trello"
        //status: "enabled"
        //teamId: 279
        //thumbnailUrl: "https://www.jandi.io/images/bot_assets/bot-trello.png"
        //type: "bots"
        //typeCategory: "1:1 대화방"

        scope.isActive = scope.status === 'enabled';

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
      function onServiceToggle($value) {
        if (scope.onStatusChange) {
          scope.onStatusChange({
            $connectId: scope.connectId,
            $status: $value
          });
        }
      }

      /**
       * setting handler
       * @param event
       */
      function onSettingClick(event) {
        //event.stopPropagation();

        if (scope.onSetting) {
          scope.onSetting({
            $connectId: scope.connectId
          });
        }
      }

      /**
       * delete handler
       * @param {object} event
       */
      function onDeleteClick(event) {
        event.stopPropagation();

        if (scope.onDelete) {
          scope.onDelete({
            $connetId: scope.connectId
          });
        }
      }
    }
  }
})();
