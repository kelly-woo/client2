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
    this.getAllAuth = getAllAuth;
    this.getConnectInfo = getConnectInfo;

    /**
     * plug list 를 조회한다.
     * @returns {*}
     */
    function getList() {
      var teamId = currentSessionHelper.getCurrentTeam().id;
      return $http({
        method: 'GET',
        url: _apiUrl + 'teams/' + teamId + '/connect'
      });
    }

    /**
     * 모든 서비스의 인증 정보를 조회한다.
     * @returns {*}
     */
    function getAllAuth() {
      return $http({
        method: 'GET',
        url: _apiUrl + 'authentication'
      });
    }

    /**
     * 모든 서비스의 bot default 이미지 url 을 포함한 각종 정보들을 반환한다.
     * @returns {*}
     */
    function getConnectInfo() {
      return $http({
        method: 'GET',
        url: _apiUrl + 'connect'
      });
    }
  }
})();
