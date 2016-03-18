'use strict';

var app = angular.module('jandiApp');

app.factory('leftpanelAPIservice', function($http, $rootScope, $state, $filter, storageAPIservice,
                                            memberService, RoomTopicList, configuration, currentSessionHelper) {
  var leftpanelAPI = {};

  leftpanelAPI.getLists = function(deferredObject) {
    return $http({
      method: 'GET',
      url: $rootScope.server_address + 'leftSideMenu',
      params: {
        teamId: memberService.getTeamId()
      },
      timeout: !!deferredObject ? deferredObject.promise : ''
    });
  };

  // TODO: SHOULD MOVE TO memberService
  // TODO: OR TO TUTORIAL SERVICE.

  leftpanelAPI.setTutorial = function() {
    return $http({
      method: 'PUT',
      url: $rootScope.server_address + 'settings/tutoredAt'
    });
  };

  leftpanelAPI.getDefaultChannel = function(input) {
    var defaultChannelId = input.team.t_defaultChannelId;
    var joindEntityList = RoomTopicList.toJSON(true);
    if (!RoomTopicList.get(defaultChannelId, true)) {
      _.forEach(joindEntityList, function(entity) {
        defaultChannelId = entity.id;
        return false;
      });
    }
    return defaultChannelId;
  };

  leftpanelAPI.getMessages = function() {
    var _teamId = currentSessionHelper.getCurrentTeam().id;
    return $http({
      method: 'GET',
      url: configuration.server_address + 'teams/' + _teamId + '/messages/cache'
    });
  };

  return leftpanelAPI;
});
