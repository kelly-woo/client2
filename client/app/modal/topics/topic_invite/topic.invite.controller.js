(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicInviteCtrl', TopicInviteCtrl);

  function TopicInviteCtrl($scope, $rootScope, $modalInstance, $timeout, entityheaderAPIservice, $state, $filter,
                                 publicService, analyticsService, modalHelper, analyticsHelper) {
    InitInvite();

    /*
     Generating list of users that are not in current channel or private group.
     */
    function InitInvite() {
      var members = $scope.currentEntity.ch_members || $scope.currentEntity.pg_members;
      var totalUserList = $scope.memberList;
      var msg1;
      var msg2;

      $scope.availableMemberList = _.reject(totalUserList, function(user) { return members.indexOf(user.id) > -1 || user.status == 'disabled' });
      $scope.inviteUsers = _.reject($scope.availableMemberList, function(user) {
        return user.selected === false;
      });
      $scope.inviteChannel = $scope.availableMemberList.length !== 0;

      if ($scope.account && $scope.account.memberships.length >= 2) {
        // team size >= 2
        msg1 = '@emptyMsg-everyone-in-current-topic';
        msg2 = '@emptyMsg-invite-not-joined-teammate';
      } else {
        // team size < 2
        msg1 = '@emptyMsg-no-team-member-joined';
        msg2 = '@emptyMsg-click-to-invite-to-current-team';
      }

      $scope.inviteTeamMsg1 = $filter('translate')(msg1);
      $scope.inviteTeamMsg2 = $filter('translate')(msg2);
    }

    $scope.onInviteTeamClick = function() {
      $modalInstance.dismiss('cancel');
      modalHelper.openInviteToTeamModal();
    };

    // See if 'user' is a member of current channel/privateGroup.
    $scope.isMember = function(user, entityType) {
      if (entityType == 'channel')
        return jQuery.inArray(user.id, $scope.currentEntity.ch_members) >  -1;

      return jQuery.inArray(user.id, $scope.currentEntity.pg_members) >  -1;
    };

    // Below function gets called when 'enter/click' happens in typeahead.
    // This function is buggyyyy
    // TODO : FIX IT!
    $scope.onSelect = function(item) {
      item.selected = true;
      $scope.inviteUsers.indexOf(item) < 0 && $scope.inviteUsers.push(item);
    };
    $scope.onRemove = function(item) {
      item.selected = false;
      $scope.inviteUsers.splice($scope.inviteUsers.indexOf(item), 1);
    };

    $scope.onInviteClick = function(entityType) {
      var guestList = [];

      if (!$scope.isLoading && $scope.inviteUsers.length > 0) {
        $scope.toggleLoading();

        angular.forEach($scope.inviteUsers, function(user) {
          this.push(user.id);
        }, guestList);

        entityheaderAPIservice.inviteUsers(entityType, $state.params.entityId, guestList)
          .success(function(response) {
            //console.log(response)
            // analytics
            var entity_type = "";
            var topicType;
            switch (entityType) {
              case 'channels':
                topicType = 'public';
                entity_type = "topic";
                break;
              case 'privategroups':
                topicType = 'private';
                entity_type = "private group";
                break;
              default:
                topicType = 'invalid';
                entity_type = "invalid";
                break;
            }
            //Analtics Tracker. Not Block the Process
            var property = {};
            property[analyticsHelper.PROPERTY.RESPONSE_SUCCESS] = true;
            property[analyticsHelper.PROPERTY.TOPIC_TYPE] = topicType;
            property[analyticsHelper.PROPERTY.TOPIC_ID] = parseInt($state.params.entityId, 10);
            property[analyticsHelper.PROPERTY.MEMBER_COUNT] = guestList.length;
            analyticsHelper.track(analyticsHelper.EVENT.TOPIC_MEMBER_INVITE, property);

            analyticsService.mixpanelTrack( "Entity Invite", { "type": entity_type, "count": guestList.length } );

            // TODO -  ASK JOHN FOR AN API THAT RETRIEVES UPDATED INFO OF SPECIFIC TOPIC/PG.
            $rootScope.$broadcast('updateLeftPanelCaller');

            $modalInstance.dismiss('success');
          })
          .error(function(error) {
            //Analtics Tracker. Not Block the Process
            var property = {};
            property[analyticsHelper.PROPERTY.RESPONSE_SUCCESS] = false;
            property[analyticsHelper.PROPERTY.ERROR_CODE] = error.code;
            analyticsHelper.track(analyticsHelper.EVENT.TOPIC_MEMBER_INVITE, property);
            // TODO - TO JAY, MAYBE WE NEED TO SHOW MESSAGE WHY IT FAILED??
            console.error('inviteUsers', error.msg );
          })
          .finally(function() {
            $scope.toggleLoading();
          });
      }
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.toggleLoading = function() {
      $scope.isLoading = !$scope.isLoading;
    };
  }
})();


