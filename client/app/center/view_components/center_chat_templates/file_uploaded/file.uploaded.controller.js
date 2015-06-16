(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('fileUploadedCtrl', fileUploadedCtrl);

  /* @ngInject */
  function fileUploadedCtrl($scope, fileAPIservice, $state, entityheaderAPIservice, entityAPIservice) {
    var content = $scope.msg.message.content;

    $scope.$on('onChangeShared', function(event, data) {
      // shared 갱신
      $scope.msg.message.shared = fileAPIservice.updateShared($scope.msg.message);
    });

    // integration file 이면 download를 표기하지 않음
    $scope.isIntegrateFile = fileAPIservice.isIntegrateFile(content.serverUrl);


    $scope.onClickSharedEntity = onClickSharedEntity;

    /**
     * shared entity 클릭시 이벤트 핸들러
     * @param {string} entityId
     */
    function onClickSharedEntity(entityId, entityType) {
      // TODO: File detail controller 에도 중복 로직이 있음.
      if (entityType === 'users') {
        $state.go('archives', {entityType: entityType, entityId: entityId});

      } else {

        var targetEntity = entityAPIservice.getEntityFromListById($scope.joinedEntities, entityId);

        // If 'targetEntity' is defined, it means I had it on my 'joinedEntities'.  So just go!
        if (angular.isDefined(targetEntity)) {
          $state.go('archives', { entityType: targetEntity.type, entityId: targetEntity.id });
        }
        else {
          // Undefined targetEntity means it's an entity that I'm joined.
          // Join topic first and go!
          entityheaderAPIservice.joinChannel(entityId)
            .success(function(response) {
              analyticsService.mixpanelTrack( "topic Join" );
              $rootScope.$emit('updateLeftPanelCaller');
              $state.go('archives', {entityType: 'channels',  entityId: entityId });
            })
            .error(function(err) {
              alert(err.msg);
            });
        }
      }
    }
  }
}());
