/**
 * @fileoverview 잔디 커넥트 api 서비스 모듈
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnectApi', JndConnectApi);


  function JndConnectApi($http, $filter, configuration, currentSessionHelper, JndConnect, Dialog) {
    var _apiUrl = configuration.api_connect_address;

    this.getList = getList;
    this.getAllAuth = getAllAuth;
    this.getConnectInfo = getConnectInfo;
    this.handleError = handleError;

    /**
     * plug list 를 조회한다.
     * @returns {*}
     */
    function getList() {
      var teamId = currentSessionHelper.getCurrentTeam().id;
      return $http({
        method: 'GET',
        url: _apiUrl + 'teams/' + teamId + '/connect'
      }).error(handleError);
    }

    /**
     * 모든 서비스의 인증 정보를 조회한다.
     * @returns {*}
     */
    function getAllAuth() {
      return $http({
        method: 'GET',
        url: _apiUrl + 'authentication'
      }).error(handleError);
    }

    /**
     * 모든 서비스의 bot default 이미지 url 을 포함한 각종 정보들을 반환한다.
     * @returns {*}
     */
    function getConnectInfo() {
      return $http({
        method: 'GET',
        url: _apiUrl + 'connect'
      }).error(handleError);
    }

    /**
     *
     * @param {object} err
     * @param {number} status
     * @param {boolean} [isOnlyShowConfirm=false] confirm 만 보여주고 이후 처리는 하지 않을지 여부
     */
    function handleError(err, status, isOnlyShowConfirm) {
      var adminEntity = currentSessionHelper.getCurrentTeamAdmin();
      //권한 없는 경우
      if (status === 403) {
        Dialog.alert({
          allowHtml: true,
          body: $filter('translate')('@jnd-connect-226').replace('{{adminName}}', adminEntity.name)
        });
        if (!isOnlyShowConfirm) {
          JndConnect.backToMain();
        }
        return true;
      } else {
        return false;
      }
    }
  }
})();
