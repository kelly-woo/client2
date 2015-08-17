/**
 * @fileoverview team member item controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TeamMemberListTemplateCtrl', TeamMemberListTemplateCtrl);

  /* @ngInject */
  function TeamMemberListTemplateCtrl($scope, $state, jndPubSub, memberService, publicService,
                                      $filter, modalHelper) {

    _init();

    function _init() {
      $scope.isDisabledMember = publicService.isDisabledMember($scope.member);
      $scope.isMySelf = $scope.member.id === memberService.getMemberId();
      $scope.memberName = $filter('getName')($scope.member);
      $scope.memberSmallProfilePic = $filter('getSmallThumbnail')($scope.member);

      $scope.onMemberClick = onMemberClick;
      $scope.onStarClick = onStarClick;
    }

    /**
     * member click event handler
     * @param entityId
     */
    function onMemberClick(entityId) {
      if (entityId !== memberService.getMemberId()) {
        // go to DM

        $state.go('archives', { entityType: 'users',  entityId: entityId });
        $scope.cancel();
      } else {
        // open profile modal

        modalHelper.openCurrentMemberModal();
      }
    }

    /**
     * star click event handler
     * @param entityType
     * @param entityId
     */
    function onStarClick(entityType, entityId) {
      var param = {
        entityType: entityType,
        entityId: entityId
      };

      jndPubSub.pub('onStarClick', param);
    }
  }
})();
