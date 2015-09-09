/**
 * @fileoverview join topic controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicJoinCtrl', TopicJoinCtrl);

  /* @ngInject */
  function TopicJoinCtrl($scope, $timeout, memberService, modalHelper) {
    _init();

    /**
     * 처음 모달이 열렸을 때 실행되어야 할 부분.
     */
    function _init() {
      $scope.memberId = memberService.getMemberId();
      $scope.channelTitleQuery = '';

      $scope.cancel = modalHelper.closeModal;
      $scope.newChannel = newChannel;

      $scope.onListClick = onListClick;
    }

    /**
     * 토픽을 만드는 모달을 열고 현재 열려있는 조인 모달은 닫는다.
     */
    function newChannel() {
      $scope.cancel();
      modalHelper.openTopicCreateModal();
    }

    /**
     * list click event handler
     */
    function onListClick() {
      $timeout(function() {
        $('#invite-member-filter').focus();
      });
    }
  }
})();
