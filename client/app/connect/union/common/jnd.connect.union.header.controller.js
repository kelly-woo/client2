(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionHeaderCtrl', JndConnectUnionHeaderCtrl);

  /* @ngInject */
  function JndConnectUnionHeaderCtrl($scope, jndPubSub, JndConnect, EntityMapManager) {

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      //console.log('####', $scope)
    }

    function requestStatusChange() {

    }

    function requestConnectDelete() {

    }

    function requestAddGoogleAccount() {

    }

    function requestDeleteGoogleAccount() {

    }
  }
})();
