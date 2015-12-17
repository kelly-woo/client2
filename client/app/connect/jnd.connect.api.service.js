/**
 * @fileoverview 잔디 커넥트 api 서비스 모듈
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnectApi', JndConnectApi);


  function JndConnectApi($http, configuration, currentSessionHelper) {
    var _apiUrl = configuration.api_connect_address;
    this.getList = getList;

    /**
     * plug list 를 받아온다
     * @returns {*}
     */
    function getList() {
      var teamId = currentSessionHelper.getCurrentTeam().id;
      return $http({
        method: 'GET',
        url: _apiUrl + 'teams/' + teamId + '/connect'
      });
    }
  }
})();
