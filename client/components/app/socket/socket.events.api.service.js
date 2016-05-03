/**
 * @fileoverview 소켓 이벤트에 따라 다른 로직으로 처리하는 곳.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('SocketEventApi', SocketEventApi);

  /* @ngInject */
  function SocketEventApi($http, configuration) {
    var API_URL = configuration.api_address + 'inner-api/';

    this.get = get;
    /**
     *
     * @param {object} params
     *    @param {number} params.ts
     *    @param {number} [params.size]
     *    @param {number} [params.memberId]
     *    @param {number} [params.eventType]
     */
    function get(params) {

      return $http({
        method: 'GET',
        url: API_URL + 'events',
        params: params
      });
    }
  }
})();
