/**
 * @fileoverview 자신을 제외한 team 전체 member를 출력하고 member 즐겨찾기 및 dm 기능을 제공함
 */
(function () {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TeamMemberListCtrl', TeamMemberListCtrl);

  /* @ngInject */
  function TeamMemberListCtrl($scope, $modalInstance, currentSessionHelper, memberService) {
    var DISABLED_MEMBER_STATUS = 'disabled';

    _init();

    function _init() {
      $scope.emptyMessageStateHelper = 'NO_MEMBER_IN_TEAM';

      $scope.cancel = cancel;

      $scope.memberListSetting = {
        enabledMemberList: {
          active: true
        },
        disabledMemberList: {
          active: false
        }
      };

      generateMemberList();
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
     * close modal
     */
    function cancel() {
      $modalInstance.dismiss('close');
    }
  }
})();
