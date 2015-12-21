(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionAuthCtrl', JndConnectUnionAuthCtrl);

  /* @ngInject */
  function JndConnectUnionAuthCtrl($scope, configuration, Popup) {
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
      Popup.open(configuration.connect_auth_address + 'connect/auth/' + $scope.current.union.name, {
        name: 'connectAuth',
        optionStr: 'resizable=no, scrollbars=1, toolbar=no, menubar=no, status=no, directories=no, width=1024, height=768',
        data: {
          redirectUri: '/popup/success?callbackEvent=popupDone'
        }
      });
    }
  }
})();
