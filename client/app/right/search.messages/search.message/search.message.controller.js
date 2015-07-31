(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelMessageSearchCardCtrl', rPanelMessageSearchCardCtrl);

  /* @ngInject  */
  function rPanelMessageSearchCardCtrl($scope, $rootScope, $state, MessageQuery, currentSessionHelper, jndPubSub) {
    _init();

    function _init() {
      $scope.message.entity.extContentType = $scope.message.entity.type;

      $scope.prev = _setMessageData($scope.message.prev);
      $scope.current = _setMessageData($scope.message.current, true);
      $scope.next = _setMessageData($scope.message.next);

      $scope.entity = $scope.message.entity;
      $scope.messageType = 'message';
    }

    function _setMessageData(messageData, hasStar) {
      var data;

      if (messageData != null) {
        data = _.extend({}, $scope.message.entity, messageData);
      }

      hasStar && (data.hasStar = true);

      return data;
    }

    $scope.onMessageCardClick = onMessageCardClick;

    function onMessageCardClick($event) {
      var toEntityId = $scope.entity.id;
      var toLinkId = $scope.current.linkId;

      if ($event.target.className.indexOf('star') < 0) {
        MessageQuery.setSearchLinkId(toLinkId);

        if (!_isToEntityCurrent(toEntityId)) {
          _goTo($scope.entity);
        } else {
          jndPubSub.pub('jumpToMessageId');
        }
      } else {
        $event.stopPropagation();
      }
    }

    function _isToEntityCurrent(toEntityId) {
      return currentSessionHelper.getCurrentEntityId() === toEntityId;
    }

    function _goTo(state) {
      $state.go('archives', { entityType: state.type + 's', entityId: state.id });
    }
  }
})();
