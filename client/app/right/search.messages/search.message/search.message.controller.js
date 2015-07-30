(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelMessageSearchCardCtrl', rPanelMessageSearchCardCtrl);

  /* @ngInject  */
  function rPanelMessageSearchCardCtrl($scope, $rootScope, $state, MessageQuery) {
    _init();

    function _init() {
      $scope.message.entity.extContentType = $scope.message.entity.type;

      $scope.prev = _setMessageData($scope.message.prev);
      $scope.current = _setMessageData($scope.message.current);
      $scope.next = _setMessageData($scope.message.next);

      $scope.entity = $scope.message.entity;
      $scope.messageType = 'message';
    }

    function _setMessageData(messageData) {
      var data;

      if (messageData != null) {
        data = _.extend({}, $scope.message.entity, messageData);
      }

      return data;
    }

    $scope.onMessageCardClick = onMessageCardClick;

    function onMessageCardClick() {
      var toEntityId = $scope.entity.id;
      var toLinkId = $scope.current.linkId;

      MessageQuery.setSearchLinkId(toLinkId);

      if (!_isToEntityCurrent(toEntityId)) {
        _goTo($scope.entity);
      } else {
        $rootScope.$broadcast('jumpToMessageId');
      }
    }

    function _isToEntityCurrent(toEntityId) {
      return $scope.currentEntity.id == toEntityId;
    }

    function _goTo(state) {
      $state.go('archives', { entityType: state.type + 's', entityId: state.id });
    }
  }
})();
