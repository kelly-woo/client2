(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('StarAPIService', StarAPIService);

  /* @ngInject */
  function StarAPIService($http, memberService, configuration) {
    var _server_address = configuration.server_address;
    var _teamId = memberService.getTeamId();

    this.get = get;
    this.getItem = getItem;
    this.star = star;
    this.unStar = unStar;

    /**
     * star 된 아이템의 리스트를 조회한다.
     * @param {Number|String} starredId
     * @param {Number|String} count
     * @param {String} type
     * @param {Number|String} [teamId=_teamId]
     * @returns {*}
     */
    function get(starredId, count, type, teamId) {
      teamId = teamId || _teamId;
      return $http({
        method: 'GET',
        url: _server_address + 'teams/' + teamId + '/messages/starred',
        params: {
          starredId: starredId,
          count: count,
          type: type
        }
      });
    }

    /**
     * star 된 특정 아이템을 조회한다.
     * @param {Number|String} starredId
     * @param {Number|String} [teamId=_teamId]
     * @returns {*}
     */
    function getItem(messageId, teamId) {
      teamId = teamId || _teamId;
      return $http({
        method: 'GET',
        url: _server_address + 'teams/' + teamId + '/messages/' + messageId + '/starred'
      });
    }

    /**
     * 즐겨찾기 한다.
     * @param {Number|String} messageId
     * @param {Number|String} [teamId=_teamId]
     * @returns {*}
     */
    function star(messageId, teamId) {
      teamId = teamId || _teamId;
      return $http({
        method  : 'POST',
        url     : _server_address + 'teams/' + teamId + '/messages/' + messageId + '/starred'
      });
    }

    /**
     * 즐겨찾기 해제 한다.
     * @param {Number|String} messageId
     * @param {Number|String} [teamId=_teamId]
     * @returns {*}
     */
    function unStar(messageId, teamId) {
      teamId = teamId || _teamId;
      return $http({
        method  : 'DELETE',
        url     : _server_address + 'teams/' + teamId + '/messages/' + messageId + '/starred'
      });
    }
  }
})();
