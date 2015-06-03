(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicJoinCtrl', TopicJoinCtrl);

  /* @ngInject */
  function TopicJoinCtrl($scope, $modalInstance, $state, entityheaderAPIservice, analyticsService, memberService, publicService, jndPubSub) {

    // id of topic to join
    var entityIdToJoin;

    (function() {
      init();
    })();

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
    $scope.cancel = function() {
      publicService.closeModal($modalInstance);
    };

    /**
     * 토픽을 만드는 모달을 열고 현재 열려있는 조인 모달은 닫는다.
     */
    $scope.newChannel = function() {
      $scope.openModal('channel');
      this.cancel();
    };


    /**
     * 선택 된 토픽을 조인한다.
     * @param entityId {number} id of topic to join
     */
    $scope.onJoinClick = function(entityId) {
      if ($scope.isLoading) return;

      $scope.toggleLoading();

      entityIdToJoin = entityId;

      entityheaderAPIservice.joinChannel(entityIdToJoin)
        .success(
          _onTopicJoinSuccess
        )
        .error(function(error) {
          console.log('onJoinClick', error.msg);
        })
        .finally(function() {
          $scope.toggleLoading();
        });
    };


    /**
     * Callback function for topic join success.
     * @private
     */
    function _onTopicJoinSuccess() {
      // analytics
      analyticsService.mixpanelTrack( "topic Join" );

      jndPubSub.updateLeftPanel();

      // TODO: REFACTOR -> ROUTE SERVICE
      $state.go('archives', {entityType: 'channels', entityId: entityIdToJoin});

      publicService.closeModal($modalInstance);
    }
  }
})();
