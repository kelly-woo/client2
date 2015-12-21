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

    this.create = create;
    this.update = update;
    this.remove = remove;

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
        method: 'POST',
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
        return $upload.upload(options);
      } else {
        delete data.botThumbnailFile;
        return $http(options);
      }
    }

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
  }
})();
