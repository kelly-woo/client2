/**
 * @fileoverview 잔디 컨넥트 서비스(union) 에 연결된 plug 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectCardPlugCtrl', JndConnectCardPlugCtrl);

  /* @ngInject */
  function JndConnectCardPlugCtrl($scope, jndPubSub, JndConnect, JndConnectUnionApi, JndUtil, Dialog) {
    $scope.toggleOnOff = toggleOnOff;
    $scope.modify = modify;

    $scope.onErrorRemove = onErrorRemove;
    $scope.onSuccessRemove = onSuccessRemove;

    $scope.onSuccessSwitch = onSuccessSwitch;
    $scope.onErrorSwitch = onErrorSwitch;

    /**
     * plug 의 on off 상태를 토글한다.
     */
    function toggleOnOff() {
      $scope.plug.isOn = !$scope.plug.isOn;
    }

    /**
     * "수정" 버튼 이벤트 핸들러
     */
    function modify() {
      JndConnect.modify($scope.union.name, $scope.plug.raw.id);
    }

    /**
     * 삭제 성공 이벤트 핸들러
     * @private
     */
    function onSuccessRemove() {
      JndConnect.reloadList();
    }

    /**
     * 삭제 실패 이벤트 핸들러
     * @param {object} response
     * @private
     */
    function onErrorRemove(response) {
      JndConnect.reloadList();
    }

    function onSuccessSwitch() {
    }

    function onErrorSwitch(response) {
    }
  }
})();
