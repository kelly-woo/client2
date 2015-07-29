/**
 * @fileoverview 튜토리얼 C패널 헤더 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TutorialEntityHeaderCtrl', TutorialEntityHeaderCtrl);

  function TutorialEntityHeaderCtrl($scope, TutorialEntity) {

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      $scope.entity = TutorialEntity.get();
    }
  }
})();
