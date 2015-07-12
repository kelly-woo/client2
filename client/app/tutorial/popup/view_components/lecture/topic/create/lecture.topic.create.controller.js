/**
 * @fileoverview 튜토리얼 토픽 생성 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureTopicCreateCtrl', function ($scope, $rootScope, $state) {
    _init();

    /**
     * initialize
     * @private
     */
    function _init() {

    }

    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
      $scope.$on('$destroy', _onDestroy);
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {

    }
  });
})();
