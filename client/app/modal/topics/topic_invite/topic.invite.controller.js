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

      $scope.onMemberClick = onMemberClick;
      $scope.onInviteTeamClick = onInviteTeamClick;
      $scope.onSelectAll = onSelectAll;
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

      $scope.isInviteChannel = $scope.availableMemberList.length !== 0;
      if ($scope.isInviteChannel) {
        // 초대 가능한 member가 존재하므로 topic 초대 process 진행함

        // has all members
        $scope.hasAllMembers = $scope.inviteUsers.length === $scope.availableMemberList.length;
      }
    }

    /**
     * insert selected member
     */
    function onInviteTeamClick() {
      $modalInstance.dismiss('cancel');
      modalHelper.openInviteToTeamModal();
    }

    /**
     * member click event handler
     * @param {object} member
     * @param {boolean} value
     */
    function onMemberClick(member, value) {
      var fn = value !== false ? _addMember : _removeMember;

      fn(member);

      focusInput();
    }

    /**
     * add selected member
     * @param {object} member
     */
    function _addMember(member) {
      var inviteUsers = $scope.inviteUsers;

      member.selected = true;
      inviteUsers.indexOf(member) < 0 && inviteUsers.unshift(member);
    }

    /**
     * remove selected member
     * @param {object} member
     */
    function _removeMember(member) {
      var inviteUsers = $scope.inviteUsers;

      member.selected = false;
      inviteUsers.splice(inviteUsers.indexOf(member), 1);
    }

    /**
     * invite member
     * @param {string} entityType - channel or privategroup
     */
    function onInviteClick(entityType) {
      var guestList = [];
      if (!$scope.isLoading && $scope.inviteUsers.length > 0) {

        jndPubSub.showLoading();

        angular.forEach($scope.inviteUsers, function(user) {
          this.push(user.id);
        }, guestList);

        entityheaderAPIservice.inviteUsers(entityType, $state.params.entityId, guestList)
          .success(function() {
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

    /**
     * select all members event handler
     * @param {boolean} value
     */
    function onSelectAll(value) {
      var fn = value ? _addMember : _removeMember;

      _.each($scope.availableMemberList, function(member) {
        fn(member);
      });

      focusInput();
    }

    /**
     * input filter에 focus
     */
    function focusInput() {
      $timeout(function() {
        $('#invite-member-filter').focus();
      });
    }
  }
})();
