(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionAuthCtrl', JndConnectUnionAuthCtrl);

  /* @ngInject */
  function JndConnectUnionAuthCtrl($scope, $filter, JndConnect) {
    $scope.getAuth = getAuth;
    $scope.text = {};
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.text.authBtn = $filter('translate')('@jnd-connect-144')
        .replace('{{serviceName}}', $scope.current.union.title);
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
