(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionNavCtrl', JndConnectUnionNavCtrl);

  /* @ngInject */
  function JndConnectUnionNavCtrl($scope, JndConnect) {

    $scope.backToMain = _.bind(JndConnect.backToMain, null, true);

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
    }
  }
})();
