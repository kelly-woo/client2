/**
 * @fileoverview 튜토리얼 토픽 생성 모달 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TutorialModalTopicCreateCtrl', TutorialModalTopicCreateCtrl);

  function TutorialModalTopicCreateCtrl($scope, jndPubSub, jndKeyCode) {
    $scope.onClickCreate = onClickCreate;
    $scope.entityName = '';
    $scope.onKeyDown = onKeyDown;
    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
    }

    /**
     * 토픽 생성 버튼 클릭시 이벤트 핸들러
     */
    function onClickCreate() {
      _createTopic();
    }

    /**
     * key down event 핸들러
     * @param {object} keyDownEvent
     */
    function onKeyDown(keyDownEvent) {
      var keyCode = keyDownEvent.keyCode;
      if (jndKeyCode.match('ENTER', keyCode)) {
        _createTopic();
      }
    }

    /**
     * topic 을 생성한다.
     * @private
     */
    function _createTopic() {
      var entityName = _.trim($scope.entityName);
      if (entityName.length > 0) {
        jndPubSub.pub('tutorial:createTopic', entityName);
      }
    }
  }
})();
