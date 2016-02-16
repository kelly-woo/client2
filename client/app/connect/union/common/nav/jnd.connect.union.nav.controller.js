(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionNavCtrl', JndConnectUnionNavCtrl);

  /* @ngInject */
  function JndConnectUnionNavCtrl($scope, JndConnect) {

    $scope.backToMain = JndConnect.backToMain;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
    }
  }
})();
