/**
 * @fileoverview 잔디 컨넥트 서비스(union) 에 연결된 plug 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionPlugCtrl', JndConnectUnionPlugCtrl);

  /* @ngInject */
  function JndConnectUnionPlugCtrl($scope) {
    $scope.toggleOnOff = toggleOnOff;

    /**
     * plug 의 on off 상태를 토글한다.
     */
    function toggleOnOff() {
      $scope.plug.isOn = !$scope.plug.isOn;
    }
  }
})();
