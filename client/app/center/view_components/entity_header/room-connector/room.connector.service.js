/**
 * @fileoverview room connector service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('RoomConnector', RoomConnector);

  /* @ngInject */
  function RoomConnector($http, configuration, memberService) {
    var that = this;
    var teamId = memberService.getTeamId();

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      that.getConnectInfo = getConnectInfo;
    }

    function getConnectInfo(roomId) {
      return $http({
        method: 'GET',
        url: configuration.api_connect_address + 'teams/' + teamId + '/rooms/' + roomId + '/connect'
      });
    }
  }
})();
