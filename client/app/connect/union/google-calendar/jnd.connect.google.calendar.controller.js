(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGoogleCalendarCtrl', JndConnectGoogleCalendarCtrl);

  /* @ngInject */
  function JndConnectGoogleCalendarCtrl($scope, JndConnect, EntityMapManager) {
    $scope.selectedRoom = null;
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
    }
  }
})();
