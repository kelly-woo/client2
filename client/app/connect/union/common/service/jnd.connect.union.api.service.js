/**
 * @fileoverview 잔디 커넥트 union 공통 api 서비스 모듈
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnectUnionApi', JndConnectUnionApi);


  function JndConnectUnionApi($upload, $http, configuration, currentSessionHelper) {
    var _apiUrl = configuration.api_connect_address;

    this.read = read;
    this.create = create;
    this.update = update;
    this.remove = remove;
    this.getWebhookToken = getWebhookToken;
    this.setStatus = setStatus;

    /**
     * connectId 에 해당하는 connect 정보를 반환한다.
     * @param {string} unionName
     * @param {number} connectId
     * @returns {*}
     */
    function read(unionName, connectId) {
      var teamId = currentSessionHelper.getCurrentTeam().id;
      return $http({
        method: 'GET',
        url: _apiUrl + 'teams/' + teamId + '/' + unionName +'/' + connectId
      });
    }

    /**
     * connect 를 생성한다
     * @param {string} unionName
     * @param {object} data
     * @returns {*}
     */
    function create(unionName, data) {
      var teamId = currentSessionHelper.getCurrentTeam().id;
      return _requestMultipartConnect({
        method: 'POST',
        url: _apiUrl + 'teams/' + teamId + '/' + unionName,
        data: data
      });
    }

    /**
     * connect 를 수정한다
     * @param {string} unionName
     * @param {object} data
     * @returns {*}
     */
    function update(unionName, data) {
      var teamId = currentSessionHelper.getCurrentTeam().id;
      return _requestMultipartConnect({
        method: 'PUT',
        url: _apiUrl + 'teams/' + teamId + '/' + unionName + '/setting',
        data: data
      })
    }

    /**
     * multipart upload 를 지원하기 위한 메서드
     * @param {object} options
     * @returns {*}
     * @private
     */
    function _requestMultipartConnect(options) {
      var data = options.data;
      if (_.isObject(data.botThumbnailFile)) {
        _.extend(options, {
          file: data.botThumbnailFile,
          fileFormDataName: 'botThumbnailFile'
        });
        delete data.botThumbnailFile;
      }
      return $upload.upload(options);
    }

    /**
     * 해당 connect 를 삭제한다.
     * @param {string} unionName
     * @param {number} connectId
     * @returns {*}
     */
    function remove(unionName, connectId) {
      var teamId = currentSessionHelper.getCurrentTeam().id;
      return $http({
        method: 'DELETE',
        url: _apiUrl + 'teams/' + teamId + '/' + unionName,
        params: {
          connectId: connectId
        }
      });
    }

    /**
     * 웹훅 용 토큰 요청 API
     * @param {string} unionName
     * @returns {*}
     */
    function getWebhookToken(unionName) {
      var teamId = currentSessionHelper.getCurrentTeam().id;
      return $http({
        method: 'GET',
        url: _apiUrl + 'teams/' + teamId + '/' + unionName + '/token'
      });
    }

    /**
     * 활성/비활성 상태를 저장한다.
     * @param {string} unionName
     * @param {number} connectId
     * @param {boolean} isEnabled
     * @returns {*}
     */
    function setStatus(unionName, connectId, isEnabled) {
      var status = isEnabled ? 'enabled' : 'disabled';
      var teamId = currentSessionHelper.getCurrentTeam().id;
      return $http({
        method: 'PUT',
        url: _apiUrl + 'teams/' + teamId + '/' + unionName + '/status',
        data: {
          connectId: connectId,
          status: status
        }
      });
    }
  }
})();
