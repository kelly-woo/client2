/**
 * @fileoverview 자신을 제외한 team 전체 member를 출력하고 member 즐겨찾기 및 dm 기능을 제공함
 */
(function () {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TeamMemberListCtrl', TeamMemberListCtrl);

  /* @ngInject */
  function TeamMemberListCtrl($scope, $modalInstance, $state, $timeout, currentSessionHelper,
                              memberService, modalHelper, jndPubSub) {
    var DISABLED_MEMBER_STATUS = 'disabled';

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
     * @param {string} value
     * @returns {*}
     */
    function getMatches(list, value) {
      var matches;

      value = value.toLowerCase();

      matches = _.chain(list)
        .filter(function (item) {
          return item.name.toLowerCase().indexOf(value) > -1;
        })
        .sortBy(function (item) {
          return [!item.isStarred, item.name];
        })
        .value();

      if ($scope.enabledMemberList === list) {
        $scope.enableMembersLength = matches.length;
      } else {
        $scope.disableMembersLength = matches.length;
      }

      return matches;
    }

    /**
     * member list click event handler
     */
    function onMemberListClick() {
      $scope.hasFocus = true;
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

        modalHelper.openCurrentMemberModal();
      }
    }

    /**
     * set member list
     */
    function generateMemberList() {
      var enabledMemberList = [];
      var disabledMemberList = [];

      _.forEach($scope.memberList, function(member) {
        if (member.status == DISABLED_MEMBER_STATUS) {
          disabledMemberList.push(member);
        } else {
          if (memberService.getMemberId() !== member.id) {
            enabledMemberList.push(member);
          }
        }
      });

      $scope.hasMember = currentSessionHelper.getCurrentTeamMemberCount() > 0;
      $scope.enabledMemberList = enabledMemberList;
      $scope.disabledMemberList = disabledMemberList;
      $scope.hasDisabledMember = $scope.disabledMemberList.length > 0;
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
