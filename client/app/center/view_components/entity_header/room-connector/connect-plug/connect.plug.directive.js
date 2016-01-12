/**
 * @fileoverview topic connector directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('connectPlug', connectPlug);

  /* @ngInject */
  function connectPlug(memberService) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        data: '=jndDataModel',
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
        scope.isActive = scope.data.status === 'enabled';

        scope.isConnector = _isConnector();
        scope.isAllowUpdate = scope.isConnector || _isAdmin();

        scope.onSettingClick = onSettingClick;
        scope.onDeleteClick = onDeleteClick;

        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$watch('data.status', function(value) {
          scope.isActive = value === 'enabled';
        });
      }

      /**
       * setting handler
       * @param event
       */
      function onSettingClick(event) {
        event.stopPropagation();

        scope.onSetting({
          $connectId: scope.data.connectId,
          $unionName: scope.data.unionName
        });
      }

      /**
       * delete handler
       * @param {object} event
       */
      function onDeleteClick(value) {
        if (value) {
          scope.onDelete({
            $connetId: scope.data.connectId,
            $value: value
          });
        }
      }

      /**
       * connect를 생성한 connector 여부
       * @private
       */
      function _isConnector() {
        return memberService.getMemberId() === scope.data.memberId;
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
