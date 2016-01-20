(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('entityHeader', entityHeader);

  /* @ngInject */
  function entityHeader($http, $q, memberService, config, configuration) {
    var that = this;
    var teamId = memberService.getTeamId();

    _init();

    function _init() {
      that.leaveEntity = leaveEntity;
      that.deleteEntity = deleteEntity;
      that.toggleTopicNotification = toggleTopicNotification;
      that.kickOut = kickOut;
      that.getConnectInfo = getConnectInfo;
    }

    /**
     * 멤버를 토픽에서 강퇴한다.
     * @param {number} topicId - (기존 entityId)
     * @param {number} memberId
     * @returns {*}
     */
    function kickOut(topicId, memberId) {
      return $http({
        method: 'PUT',
        url: config.server_address + 'teams/' + teamId + '/topics/' + topicId + '/kickout',
        data: {
          memberId: memberId
        }
      });
    }

    function leaveEntity(entityType, entityId) {
      return $http({
        method: 'PUT',
        url: config.server_address + entityType + '/' + entityId + '/leave',
        data: {
          teamId: teamId
        }
      });
    }

    function deleteEntity(entityType, entityId) {
      return $http({
        method: 'DELETE',
        url: config.server_address + entityType + '/' + entityId,
        params: {
          teamId: teamId
        }
      });
    }

    function toggleTopicNotification(entityId, toBeValue) {
      return $http({
        method: 'PUT',
        url: config.server_address + 'teams/' + teamId + '/rooms/' + entityId + '/subscribe',
        data: {
          subscribe: toBeValue
        }
      });
    }

    /**
     * request connect info
     * @param {string} roomId
     * @returns {*}
     */
    function getConnectInfo(roomId) {
      var abortDeferred = $q.defer();
      var request = $http({
        method: 'GET',
        url: configuration.api_connect_address + 'teams/' + teamId + '/rooms/' + roomId + '/connect',
        timeout: abortDeferred.promise
      });

      request.abort = function() {
        abortDeferred.resolve();
      };
      request.finally(function() {
        request.abort = angular.noop;
      });

      return request;
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