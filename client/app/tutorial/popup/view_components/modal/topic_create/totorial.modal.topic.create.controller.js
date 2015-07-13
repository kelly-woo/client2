/**
 * @fileoverview 튜토리얼 가이드 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialModalTopicCreateCtrl', function ($scope, $rootScope, $state, jndPubSub) {
    $scope.onClickCreate = onClickCreate;
    $scope.entityName = '';

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
