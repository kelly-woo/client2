/**
 * @fileoverview member item controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('MemberItemCtrl', MemberItemCtrl);

  /* @ngInject */
  function MemberItemCtrl($scope, $filter, publicService, memberService, jndPubSub) {

    _init();

    function _init() {
      $scope.isDisabledMember = publicService.isDisabledMember($scope.member);
      $scope.isMySelf = $scope.member.id === memberService.getMemberId();
      $scope.name = $filter('getName')($scope.member);
      $scope.profileImage = $filter('getSmallThumbnail')($scope.member);

      $scope.onStarClick = onStarClick;
    }

    /**
     * star click event handler
     * @param {string} entityType
     * @param {object} member
     */
    function onStarClick(entityType, member) {
      var param = {
        entityType: entityType,
        entityId: member.id
      };

      jndPubSub.pub('onStarClick', param);
    }
  }
})();
