(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionFooterCtrl', JndConnectUnionFooterCtrl);

  /* @ngInject */
  function JndConnectUnionFooterCtrl($scope, jndPubSub, JndConnect, EntityMapManager) {
    $scope.save = save;
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
    }

    function save() {
      jndPubSub.pub('unionFooter:save');
    }
  }
})();
