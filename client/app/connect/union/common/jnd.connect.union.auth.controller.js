(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionAuthCtrl', JndConnectUnionAuthCtrl);

  /* @ngInject */
  function JndConnectUnionAuthCtrl($scope, Popup) {
    $scope.getAuth = getAuth;
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      //for test

      $scope.$on('popupDone', function() {
        $scope.union.hasAuth = true;
      });

    }

    function getAuth() {
      Popup.open('http://local.jandi.io:8080/connect/auth/' + $scope.union.name, {
        name: 'connectAuth',
        optionStr: 'resizable=no, scrollbars=1, toolbar=no, menubar=no, status=no, directories=no, width=1024, height=768',
        data: {
          redirectUri: '/popup/success?callbackEvent=popupDone'
        }
      });
    }
  }
})();
