/**
 * @fileoverview dialog(alert/confirm) controller
 */
(function() {
  'use strict';

  // FILE UPLOAD controller
  angular
    .module('jandi.dialog')
    .controller('ModalCtrl', ModalCtrl);

  /* @ngInject */
  function ModalCtrl($scope, $modalInstance, options) {

    _init();

    function _init() {
      $scope.titleClass = 'normal-title';
      $scope.bodyClass = 'normal-body';
      $scope.okayClass = 'btn-ok';
      $scope.cancelClass = 'btn-cancel';

      _.extend($scope, options);

      $scope.isAlert = $scope.type === 'alert';
      $scope.okay = okay;
      $scope.cancel = cancel;

      $modalInstance.result.then(_close, _close);
    }

    /**
     * close/dismiss callback
     * @param result
     * @private
     */
    function _close(result) {
      var fn;

      if (fn = $scope.onClose) {
        fn(result);
      }
    }

    /**
     * okay event handler
     */
    function okay() {
      $modalInstance.close('okay');
    }

    /**
     * cancel event handler
     */
    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
}());
