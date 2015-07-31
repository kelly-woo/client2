(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicInviteFromDmCtrl', TopicInviteFromDmCtrl);

  /* @ngInject */
  function TopicInviteFromDmCtrl($scope, modalHelper, jndPubSub, entityheaderAPIservice, publicService, $rootScope) {
    // WHEN INVITING FROM DIRECT MESSAGE
    $scope.cancel = modalHelper.closeModal;

    $scope.inviteOptions = publicService.getInviteOptions($rootScope.joinedChannelList, $rootScope.privateGroupList, $scope.currentEntity.id);

    $scope.onInviteClick = function(inviteTo) {
      var invitedId = [];
      invitedId.push($scope.currentEntity.id);

      jndPubSub.showLoading();

      entityheaderAPIservice.inviteUsers(inviteTo.type, inviteTo.id, invitedId)
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
    }
  }
})();
