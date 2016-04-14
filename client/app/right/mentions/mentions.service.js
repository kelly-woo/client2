/**
 * @fileoverview mentions api
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Mentions', Mentions);

  /* @ngInject */
  function Mentions($rootScope, $http, memberService) {
    var _that = this;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _that.getMentionList = getMentionList;
    }

    /**
     * get mention list
     * @param {number} messageId
     * @param {number} count
     * @returns {*}
     */
    function getMentionList(messageId, count) {
      return $http({
        method: 'GET',
        url: $rootScope.server_address + 'teams/' + memberService.getTeamId() + '/messages/mentioned',
        params: {
          messageId: messageId,
          count: count
        }
      });
    }
  }
})();
