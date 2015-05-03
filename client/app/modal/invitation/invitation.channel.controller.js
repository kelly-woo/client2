// INVITE USER TO TEAM
(function() {
  'use strict';

  // PRIVATE_GROUP/CHANNEL INVITE
  angular
    .module('jandiApp')
    .controller('invitationChannelCtrl', invitationChannelCtrl);

  function invitationChannelCtrl($scope, $rootScope, $modalInstance, entityheaderAPIservice, $state, $filter, analyticsService) {
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    generateInviteList();

    /*
     Generating list of users that are not in current channel or private group.
     */
    function generateInviteList() {
      var members = $scope.currentEntity.ch_members || $scope.currentEntity.pg_members;
      var totalUserList = $scope.memberList;

      $scope.availableMemberList = _.reject(totalUserList, function(user) { return members.indexOf(user.id) > -1 || user.status == 'disabled' });

      // 초대 가능한 member가 존재하지 않는다면 team member 초대를 유도함.
      $scope.inviteChannel = $scope.availableMemberList.length === 0 ? true : false;
    }

    // See if 'user' is a member of current channel/privateGroup.
    $scope.isMember = function(user, entityType) {
      if (entityType == 'channel')
        return jQuery.inArray(user.id, $scope.currentEntity.ch_members) >  -1;

      return jQuery.inArray(user.id, $scope.currentEntity.pg_members) >  -1;
    };

    // Below function gets called when 'enter/click' happens in typeahead.
    // This function is buggyyyy
    // TODO : FIX IT!
    $scope.onUserSelected = function(selectedUser) {
      selectedUser.selected = true;
    };

    $scope.onInviteClick = function(entityType) {
      var guestList = [];

      if (angular.isUndefined($scope.userToInviteList)) return;

      if ($scope.isLoading) return;
      $scope.toggleLoading();

      angular.forEach($scope.userToInviteList, function(user) {
        this.push(user.id);
      }, guestList);

      entityheaderAPIservice.inviteUsers(entityType, $state.params.entityId, guestList)
        .success(function(response) {
          //console.log(response)
          // analytics
          var entity_type = "";
          switch (entityType) {
            case 'channel':
              entity_type = "topic";
              break;
            case 'privateGroup':
              entity_type = "private group";
              break;
            default:
              entity_type = "invalid";
              break;
          }

          analyticsService.mixpanelTrack( "Entity Invite", { "type": entity_type, "count": guestList.length } );

          // TODO -  ASK JOHN FOR AN API THAT RETRIEVES UPDATED INFO OF SPECIFIC TOPIC/PG.
          $rootScope.$broadcast('updateLeftPanelCaller');

          $modalInstance.dismiss('success');
        })
        .error(function(error) {
          // TODO - TO JAY, MAYBE WE NEED TO SHOW MESSAGE WHY IT FAILED??
          console.error('inviteUsers', error.msg );
        })
        .finally(function() {
          $scope.toggleLoading();
        });
    };

    $scope.toggleLoading = function() {
      $scope.isLoading = !$scope.isLoading;
    };
  }
})();


