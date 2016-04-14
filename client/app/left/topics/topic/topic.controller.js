/**
 * @fileoverview left panel 에서 토픽 하나만 control 한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicCtrl', TopicCtrl);

  /* @ngInject */
  function TopicCtrl($scope, memberService, EntityHandler, jndPubSub) {
    var _currentRoom;
    var _roomId;

    $scope.isNotificationOff = false;

    $scope.onStarClick = EntityHandler.toggleStarred;

    $scope.$watch('currentRoom', function() {
      _init();
    });

    /**
     * 초기화함수이다.
     * @private
     */
    function _init() {
      _initLocalVariables();
      _attachEventListener();
      _checkTopicNotificationSetting();
    }

    function _initLocalVariables() {
      _currentRoom = $scope.currentRoom;
      _roomId = _currentRoom.id;
    }

    function _attachEventListener() {
      $scope.$on('onTopicSubscriptionChanged', _onTopicSubscriptionChanged);
    }

    /**
     * 해당 토픽의 subscribe field 가 변경되었을 때
     * @param {object} event - angular event object
     * @param {object} data - socket으로부터 온 param object
     * @private
     */
    function _onTopicSubscriptionChanged(event, data) {
      if (data.room.id === _roomId) {
        _checkTopicNotificationSetting();
      }
    }
    /**
     * 현재 joinedEntity의 notification setting 이 켜져있는지 꺼져있는지 확인한다.
     * @private
     */
    function _checkTopicNotificationSetting() {
      $scope.isNotificationOff = !memberService.isTopicNotificationOn(_roomId);
    }


    /**
     * 토픽 이름 옆에 별표를 눌렀을 때 호출된다.
     * @param {string} type - 눌린 토픽의 타입
     * @param {number} id - 토픽의 아이디
     */
    function onStarClick(type, id) {
      var params = {
        entityType: type,
        entityId: id
      };

      jndPubSub.pub('onStarClick', params);
    }
  }
})();
