/**
 * @fileoverview 튜토리얼 가이드 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialModalTopicCreateCtrl', function ($scope, $rootScope, $state, jndPubSub, jndKeyCode) {
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
     *
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
    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
    }
  });
})();
