/**
 * @fileoverview invite topic controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicInviteCtrl', TopicInviteCtrl);

  function TopicInviteCtrl($scope, $rootScope, $modalInstance, $timeout, currentSessionHelper, entityheaderAPIservice, $state, $filter,
                           entityAPIservice, analyticsService, modalHelper, AnalyticsHelper, jndPubSub) {
    var members;
    var msg1;
    var msg2;

    _init();

    /*
     Generating list of users that are not in current channel or private group.
     */
    function _init() {
      $scope.currentEntity = currentSessionHelper.getCurrentEntity();

      generateMemberList();
      $scope.selectedUser = '';

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

      $scope.onInviteTeamClick = onInviteTeamClick;
      $scope.onRemove = onRemove;
      $scope.onMemberClick = onMemberClick;
      $scope.onInviteClick = onInviteClick;
      $scope.cancel = cancel;
    }

    $scope.$on('onSetStarDone', _onSetStarDone);

    /**
     * member starred event handler
     * @private
     */
    function _onSetStarDone() {
      generateMemberList();
    }

    /**
     * set member list
     */
    function generateMemberList() {
      var prevAvailableMemberMap;

      prevAvailableMemberMap = $scope.availableMemberMap;

      members = entityAPIservice.getMemberList($scope.currentEntity);

      $scope.availableMemberMap = {};
      $scope.availableMemberList = _.reject($scope.memberList, function(user) {
        if (prevAvailableMemberMap && prevAvailableMemberMap[user.id]) {
          user.selected = prevAvailableMemberMap[user.id].selected;
        }

        $scope.availableMemberMap[user.id] = user;

        return members.indexOf(user.id) > -1 || user.status == 'disabled';
      });

      $scope.inviteUsers = _.reject($scope.availableMemberList, function(user) {
        return user.selected === false;
      });
      $scope.inviteChannel = $scope.availableMemberList.length !== 0;
    }

    /**
     * insert selected member
     */
    function onInviteTeamClick() {
      $modalInstance.dismiss('cancel');
      modalHelper.openInviteToTeamModal();
    }

    /**
     * remove selected member
     * @param {object} item
     */
    function onRemove(item) {
      item.selected = false;
      $scope.inviteUsers.splice($scope.inviteUsers.indexOf(item), 1);

      $timeout(function() {
        $('#invite-member-filter').focus();
      });
    }

    /**
     * member click event handler
     */
    function onMemberClick(member) {
      var inviteUsers = $scope.inviteUsers;

      member.selected = true;
      inviteUsers.indexOf(member) < 0 && inviteUsers.unshift(member);
    }

    /**
     * invite member
     * @param {string} entityType - channel or privategroup
     */
    function onInviteClick(entityType) {
      var guestList = [];
      var property = {};
      var PROPERTY_CONSTANT = AnalyticsHelper.PROPERTY;
      if (!$scope.isLoading && $scope.inviteUsers.length > 0) {

        jndPubSub.showLoading();

        angular.forEach($scope.inviteUsers, function(user) {
          this.push(user.id);
        }, guestList);

        entityheaderAPIservice.inviteUsers(entityType, $state.params.entityId, guestList)
          .success(function(response) {
            //console.log(response)
            // analytics
            var entity_type = "";
            switch (entityType) {
              case 'channels':
                entity_type = "topic";
                break;
              case 'privategroups':
                entity_type = "private group";
                break;
              default:
                entity_type = "invalid";
                break;
            }
            try {
              //Analtics Tracker. Not Block the Process
              AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_MEMBER_INVITE, {
                'RESPONSE_SUCCESS': true,
                'TOPIC_ID': parseInt($state.params.entityId, 10),
                'MEMBER_COUNT': guestList.length
              });
            } catch (e) {
            }

            analyticsService.mixpanelTrack( "Entity Invite", { "type": entity_type, "count": guestList.length } );

            // TODO -  ASK JOHN FOR AN API THAT RETRIEVES UPDATED INFO OF SPECIFIC TOPIC/PG.
            $rootScope.$broadcast('updateLeftPanelCaller');

            $modalInstance.dismiss('success');
          })
          .error(function(error) {
            try {
              //Analtics Tracker. Not Block the Process
              AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_MEMBER_INVITE, {
                'RESPONSE_SUCCESS': false,
                'ERROR_CODE': error.code
              });
            } catch (e) {
            }
            // TODO - TO JAY, MAYBE WE NEED TO SHOW MESSAGE WHY IT FAILED??
            console.error('inviteUsers', error.msg );
          })
          .finally(function() {
            jndPubSub.hideLoading();
          });
      }
    }

    /**
     * close modal
     */
    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
})();
