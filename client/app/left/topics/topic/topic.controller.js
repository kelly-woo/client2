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
    $scope.onTooltipShow = onTooltipShow;
    $scope.onTooltipHide = onTooltipHide;

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
      if (data.data.roomId === _roomId) {
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

    // topic title에 mouseenter시 tooltip의 출력 여부 설정하는 function
    // angular ui tooltip에 '' 문자열을 입력하면 tooltip을 출력하지 않음
    function onTooltipShow(event, joinedEntityName) {
      var target;
      var c;

      $scope.tooltip = joinedEntityName;

      target = $( event.target );
      c = target
        .clone()
        .css( {display: 'block', width: '100%', visibility: 'hidden'} )
        .appendTo(target.parent());

      if (c.width() <= target.width()) {
        $scope.tooltip = joinedEntityName;
      } else {
        $scope.tooltip = '';
      }

      c.remove();
    }

    function onTooltipHide(event) {
      $scope.tooltip = '';
    }
  }
})();
