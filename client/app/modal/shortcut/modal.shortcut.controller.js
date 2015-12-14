/**
 * @fileoverview topic을 생성하는 controller
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('ModalShortcutCtrl', ModalShortcutCtrl);

  /* @ngInject */
  function ModalShortcutCtrl($scope, $filter, HybridAppHelper, modalHelper) {
    $scope.isHybridApp = HybridAppHelper.isHybridApp();
    $scope.ctrlKey = $filter('ctrlKey')();

    $scope.close = modalHelper.closeModal;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
    }
  }
})();
