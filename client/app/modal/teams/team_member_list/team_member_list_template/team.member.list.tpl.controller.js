(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TeamMemberListTemplateCtrl', TeamMemberListTemplateCtrl);

  /* @ngInject */
  function TeamMemberListTemplateCtrl($scope, $state, jndPubSub, memberService, publicService,
                                      $filter, modalHelper) {
    $scope.onMemberClick = onMemberClick;
    $scope.onStarClick = onStarClick;

    _initScopeVariables();

    function _initScopeVariables() {
      $scope.isDisabledMember = publicService.isDisabledMember($scope.member);
      $scope.isMySelf = $scope.member.id === memberService.getMemberId();
      $scope.memberName = $filter('getName')($scope.member);
      $scope.memberSmallProfilePic = $filter('getSmallThumbnail')($scope.member);
    }

    function onMemberClick(entityId) {
      if (entityId !== memberService.getMemberId()) {
        $state.go('archives', { entityType: 'users',  entityId: entityId });
        $scope.cancel();
      } else {
        modalHelper.openCurrentMemberModal();
      }
    }

    function onStarClick(entityType, entityId) {
      var param = {
        entityType: entityType,
        entityId: entityId
      };

      jndPubSub.pub('onStarClick', param);
    }


  }
})();