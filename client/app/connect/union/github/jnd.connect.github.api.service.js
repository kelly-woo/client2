/**
 * @fileoverview 잔디 커넥트 api 서비스 모듈
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnectGithubApi', JndConnectGithubApi);


  function JndConnectGithubApi($http, $upload, configuration, currentSessionHelper) {
    var _apiUrl = configuration.api_connect_address;
    this.getRepos = getRepos;
    this.create = create;
    this.update = update;

    /**
     * plug list 를 받아온다
     * @returns {*}
     */
    function getRepos() {
      return $http({
        method: 'GET',
        url: _apiUrl + 'authenticate/github/repos'
      });
    }

    /**
     *
     * @param data
     * @param file
     * @returns {*}
     */
    function create(data, file) {
      var teamId = currentSessionHelper.getCurrentTeam().id;
      delete data.botThumbnailFile;

      return $upload.upload({
        method: 'POST',
        url: _apiUrl + 'teams/' + teamId + '/github',
        file: file,
        fileFormDataName: 'botThumbnailFile',
        data: data
      });
    }

    /**
     *
     */
    function update() {

    }
  }
})();
