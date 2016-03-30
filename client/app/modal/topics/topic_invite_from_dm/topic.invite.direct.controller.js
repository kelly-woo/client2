(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicInviteFromDmCtrl', TopicInviteFromDmCtrl);

  /* @ngInject */
  function TopicInviteFromDmCtrl($scope, modalHelper, jndPubSub, entityheaderAPIservice, publicService, RoomTopicList,
                                 TopicFolderModel, EntityHandler) {
    // WHEN INVITING FROM DIRECT MESSAGE
    $scope.cancel = modalHelper.closeModal;

    $scope.inviteOptions = TopicFolderModel.getNgOptions(
      publicService.getInviteOptions(RoomTopicList.toJSON(true), [], $scope.currentEntity.id));
    $scope.inviteChannelId = $scope.inviteOptions[0].id;
    $scope.onInviteClick = function(entityId) {
      var invitedId = [];
      var entity = EntityHandler.get(entityId);
      invitedId.push($scope.currentEntity.id);

      jndPubSub.showLoading();

      entityheaderAPIservice.inviteUsers(entity.type, entity.id, invitedId)
        .success(function(response) {
          jndPubSub.updateLeftPanel();
          modalHelper.closeModal();
        })
        .error(function(error) {
          console.error(error.code, error.msg);
        })
        .finally(function() {
          jndPubSub.hideLoading();
        });
    };
  }
})();
