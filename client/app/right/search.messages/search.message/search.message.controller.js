(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelMessageSearchCardCtrl', rPanelMessageSearchCardCtrl);

  function rPanelMessageSearchCardCtrl($scope, $state, MessageQuery, currentSessionHelper) {
    $scope.prev = $scope.message.prev;
    $scope.current = $scope.message.current;
    $scope.next = $scope.message.next;
    $scope.entity = $scope.message.entity;

    $scope.onMessageCardClick = onMessageCardClick;

    function onMessageCardClick() {

      var toEntityId = $scope.entity.id;
      var toLinkId = $scope.current.linkId;

      MessageQuery.setSearchLinkId(toLinkId);

      if (!_isToEntityCurrent(toEntityId)) {
        _goTo($scope.entity);
      } else {
        jndPubSub.pub('jumpToMessageId');
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