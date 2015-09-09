/**
 * @fileoverview join topic controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicJoinCtrl', TopicJoinCtrl);

  /* @ngInject */
  function TopicJoinCtrl($scope, memberService, modalHelper) {

    // id of topic to join
    var entityIdToJoin;

    init();

    /**
     * 처음 모달이 열렸을 때 실행되어야 할 부분.
     */
    function init() {
      $scope.memberId = memberService.getMemberId();
      $scope.channelTitleQuery = '';
      entityIdToJoin = -1;
    }

    /**
     * 모달을 닫는다.
     */
    $scope.cancel = modalHelper.closeModal;

    /**
     * 토픽을 만드는 모달을 열고 현재 열려있는 조인 모달은 닫는다.
     */
    $scope.newChannel = function() {
      $scope.cancel();
      modalHelper.openTopicCreateModal();
    };
  }
})();
