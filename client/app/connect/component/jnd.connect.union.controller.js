/**
 * @fileoverview 잔디 컨넥트 서비스(union) 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionCtrl', JndConnectUnionCtrl);

  /* @ngInject */
  function JndConnectUnionCtrl($scope, jndPubSub) {
    $scope.addPlug = addPlug;

    function addPlug() {
      jndPubSub.pub('union:addPlug', $scope.union.name);
    }
  }
})();
