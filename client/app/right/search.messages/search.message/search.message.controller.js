(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelMessageSearchCardCtrl', rPanelMessageSearchCardCtrl);

  function rPanelMessageSearchCardCtrl($scope, $rootScope, $state, messageSearchHelper) {
    $scope.prev = $scope.message.prev;
    $scope.current = $scope.message.current;
    $scope.next = $scope.message.next;
    $scope.entity = $scope.message.entity;

    $scope.onMessageCardClick = onMessageCardClick;

    function onMessageCardClick() {

      var toEntityId = $scope.entity.id;
      var toLinkId = $scope.current.linkId;

      messageSearchHelper.setLinkId(toLinkId);

      if (!_isToEntityCurrent(toEntityId)) {
        _goTo($scope.entity);
      } else {
        $rootScope.$broadcast('jumpToMessageId')
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