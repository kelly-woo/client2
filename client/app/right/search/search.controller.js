/**
 * @fileoverview right panel 상단에 위치한 search input box의 controller 이다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightSearchCtrl', RightSearchCtrl);

  /* @ngInject */
  function RightSearchCtrl($scope) {
    _init();

    // First function to be called.
    function _init() {
      $scope.isConnected = true;

      _attachScopeEvents();
    }

    function _attachScopeEvents() {
      $scope.$on('disconnected', _onDisconnected);
      $scope.$on('connected', _onConnected);
    }

    /**
     * socket disconnection handler
     * @private
     */
    function _onDisconnected() {
      $scope.isConnected = false;
    }

    /**
     * socket connection handler
     * @private
     */
    function _onConnected() {
      $scope.isConnected = true;
    }
  }
})();
