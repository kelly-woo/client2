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

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('watcher', getWatchers);


  function getWatchers() {
    this.getWatchCount = getWatchCount;

    function getWatchCount() {
      var total = 0;

      angular.element('.ng-scope').each(function() {
        var scope = $(this).scope();

        total += scope.$$watchers ? scope.$$watchers.length : 0;
      });

      return total;
    }
  }
})();