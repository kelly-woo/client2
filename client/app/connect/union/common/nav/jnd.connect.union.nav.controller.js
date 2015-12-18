(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionNavCtrl', JndConnectUnionNavCtrl);

  /* @ngInject */
  function JndConnectUnionNavCtrl($scope, jndPubSub, JndConnect, EntityMapManager) {

    $scope.backToMain = backToMain;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
    }

    function backToMain() {
      jndPubSub.pub('unionNav:backToMain');
    }
  }
})();
