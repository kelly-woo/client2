(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndUnionHeaderCtrl', JndUnionHeaderCtrl);

  /* @ngInject */
  function JndUnionHeaderCtrl($scope, jndPubSub, JndConnect, EntityMapManager) {

    $scope.backToMain = backToMain;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
    }

    function backToMain() {
      jndPubSub.pub('union:backToMain');
    }
  }
})();
