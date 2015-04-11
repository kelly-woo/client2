(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('entityHeader', entityHeader);

  /* @ngInject */
  function entityHeader($http, memberService, config) {

    var memberId = memberService.getTeamId();

    this.leaveEntity = leaveEntity;
    this.deleteEntity = deleteEntity;

    function leaveEntity(entityType, entityId) {
      return $http({
        method: 'PUT',
        url: config.server_address + entityType + '/' + entityId + '/leave',
        data: {
          teamId: memberId
        }
      });
    }

    function deleteEntity(entityType, entityId) {
      return $http({
        method: 'DELETE',
        url: config.server_address + entityType + '/' + entityId,
        params: {
          teamId: memberId
        }

      });
    }

  }

})();