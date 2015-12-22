(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionAuthCtrl', JndConnectUnionAuthCtrl);

  /* @ngInject */
  function JndConnectUnionAuthCtrl($scope, JndConnect) {
    $scope.getAuth = getAuth;
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      //for test

      $scope.$on('popupDone', function() {
        $scope.current.union.hasAuth = true;
        $scope.current.isShowAuth = false;
      });

    }

    function getAuth() {
      JndConnect.openAuthPopup($scope.current.union.name);
    }
  }
})();
