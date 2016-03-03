/**
 * @fileoverview 자신을 제외한 team 전체 member를 출력하고 member 즐겨찾기 및 dm 기능을 제공함
 */
(function () {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TeamMemberListCtrl', TeamMemberListCtrl);

  /* @ngInject */
  function TeamMemberListCtrl($scope, $modalInstance, $state, $filter, $timeout, currentSessionHelper,
                              memberService, entityAPIservice, modalHelper, jndPubSub) {
    _init();

    function _init() {
      $scope.emptyMessageStateHelper = 'NO_MEMBER_IN_TEAM';
      $scope.memberListSetting = {
        enabledMemberList: {
          active: true
        },
        disabledMemberList: {
          active: false
        }
      };

      $scope.getMatches = getMatches;

      $scope.onTabDeselect = onTabDeselect;
      $scope.onMemberClick = onMemberClick;
      $scope.onMemberListClick = onMemberListClick;
      $scope.cancel = cancel;

      generateMemberList();
    }

    $scope.$on('onSetStarDone', _onSetStarDone);

    /**
     * member starred event handler
     * @private
     */
    function _onSetStarDone() {
      generateMemberList();
      _updateMemberList();
    }

    /**
     * list에서 filter된 list를 전달한다.
     * @param {array} list
     * @param {string} filterText
     * @returns {*}
     */
    function getMatches(list, filterText) {
      var matches;

      filterText = filterText.toLowerCase();

      matches = $filter('matchItems')(list, 'name', filterText);
      matches = $filter('orderPrefixFirstBy')(matches, 'name', filterText, function (item, orderBy) {
        return [!item.isStarred, !memberService.isJandiBot(item.id)].concat(orderBy);
      });

      if ($scope.enabledMemberList === list) {
        $scope.enableMembersLength = matches.length;
      } else {
        $scope.disableMembersLength = matches.length;
      }

      return matches;
    }

    function onTabDeselect(type) {
      jndPubSub.pub('setActiveIndex:' + type, 0);
      jndPubSub.pub('updateList:' + type);
    }

    /**
     * member list click event handler
     */
    function onMemberListClick() {
      $timeout(function() {
        $('#team-member-filter').focus();
      });
    }

    /**
     * member click event handler
     * @param {object} member
     */
    function onMemberClick(member) {
      var memberId = member.id;

      if (memberId !== memberService.getMemberId()) {
        // go to DM

        $state.go('archives', {entityType: 'users', entityId: memberId});
        $scope.cancel();
      } else {
        // open profile modal

        modalHelper.openUserProfileModal($scope, member);
      }
    }

    /**
     * set member list
     */
    function generateMemberList() {
      var enabledMemberList = [];
      var disabledMemberList = [];
      var memberList = currentSessionHelper.getCurrentTeamUserList();
      var jandiBot = entityAPIservice.getJandiBot();

      if (memberList) {
        if (jandiBot) {
          enabledMemberList.push(jandiBot);
        }

        _.forEach(memberList, function(member) {
          if (memberService.isDeactivatedMember(member)) {
            disabledMemberList.push(member);
          } else {
            if (memberService.getMemberId() !== member.id) {
              enabledMemberList.push(member);
            }
          }
        });

        $scope.hasUser = currentSessionHelper.getCurrentTeamUserCount() > 0;
        $scope.enabledMemberList = enabledMemberList;
        $scope.disabledMemberList = disabledMemberList;
        $scope.hasDisabledMember = $scope.disabledMemberList.length > 0;
      }
    }

    /**
     * update member list
     * @private
     */
    function _updateMemberList() {
      jndPubSub.pub('updateList:enabledMember');
    }

    /**
     * close modal
     */
    function cancel() {
      $modalInstance.dismiss('close');
    }

  }
})();
