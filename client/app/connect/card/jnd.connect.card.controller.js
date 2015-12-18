/**
 * @fileoverview 잔디 컨넥트 서비스(union) 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectCardCtrl', JndConnectCardCtrl);

  /* @ngInject */
  function JndConnectCardCtrl($scope, jndPubSub) {
    $scope.addPlug = addPlug;

    function addPlug() {
      jndPubSub.pub('connectCard:addPlug', {
        unionName: $scope.union.name
      });
    }
  }
})();
