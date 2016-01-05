'use strict';

var app = angular.module('jandiApp');

app.factory('leftpanelAPIservice', function($http, $rootScope, $state, $filter, storageAPIservice,
                                            memberService, EntityMapManager, configuration, currentSessionHelper) {
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


  leftpanelAPI.toSignin = function() {
    currentSessionHelper.clear();
    storageAPIservice.removeLocal();
    storageAPIservice.removeSession();

    if ($state.is('signin')) {
      $state.transitionTo('signin', '', {'reload':true});
    }
    else {
      $state.transitionTo('signin', '', {'reload':true});

    }
  };

  leftpanelAPI.getJoinedChannelData = function(array) {
    var joinedChannelList = [];
    var privateGroupList = [];

    EntityMapManager.reset('private');
    EntityMapManager.reset('joined');

    angular.forEach(array, function(entity, index) {
      var type = entity.type;
      if (type == "channels") {
        joinedChannelList.push(entity);
        EntityMapManager.add('joined', entity);
      } else if (type == "privategroups") {
        privateGroupList.push(entity);
        EntityMapManager.add('private', entity);
      }
    });

    return {
      joinedChannelList: joinedChannelList,
      privateGroupList: privateGroupList
    };
  };

  leftpanelAPI.getDefaultChannel = function(input) {
    var defaultChannelId = input.team.t_defaultChannelId;
    var joindEntityMap = EntityMapManager.getMap('joined');
    if (!EntityMapManager.get('joined', defaultChannelId)) {
      _.each(joindEntityMap, function(entity) {
        defaultChannelId = entity.id;
        return false;
      });
    }
    return defaultChannelId;
  };

  leftpanelAPI.getGeneralData = function(totalEntities, joinedEntities, currentUserId) {
    var memberList = [];
    var totalChannelList = [];
    var unJoinedChannelList = [];

    EntityMapManager.reset('member');

    angular.forEach(totalEntities, function(entity, index) {
      var entityId = entity.id;
      var entityType = entity.type;

      if (entityType == "users") {
        entity.selected = false;
        memberList.push(entity);
        EntityMapManager.add('member', entity);
      } else if (entityType == "channels") {
        var found = false;
        _.each(joinedEntities, function(element, index, list) {
          if (!found && element.id == entityId) found = true;
        });

        if (!found) {
          unJoinedChannelList.push(entity);
        }

        totalChannelList.push(entity);

      }
    });


    return {
      memberList: memberList,
      totalChannelList: totalChannelList,
      unJoinedChannelList: unJoinedChannelList
    };
  };

  // TODO: REFACTOR | TO entityAPIservice - LOGIC ONLY.
  //  Initialize correct prefix for 'channel' and 'user'.

  // prefix 는 select dropdown 에서 분류의 목적으로 사용된다.
  leftpanelAPI.setEntityPrefix = function($scope) {
    EntityMapManager.reset('total');

    _.each($scope.totalEntities, function(entity) {
      entity.isStarred = !!entity.isStarred;

      if (entity.type === 'channel' || entity.type === 'channels') {
        entity.type = 'channels';
        entity.typeCategory = $filter('translate')('@common-topics');
      } else if (entity.type === 'user' || entity.type === 'users') {
        entity.type = 'users';
        entity.typeCategory = $filter('translate')('@user');
      } else {
        entity.type = 'privategroups';
        entity.typeCategory = $filter('translate')('@common-topics');
      }

      EntityMapManager.add('total', entity);
    });

    _.each($scope.joinEntities, function(entity) {
      entity.isStarred = !!entity.isStarred;
      if (entity.type === 'channel' || entity.type === 'channels') {
        entity.type = 'channels';
        entity.typeCategory = $filter('translate')('@common-topics');
      } else if (entity.type === 'user' || entity.type === 'users') {
        entity.type = 'users';
        entity.typeCategory = $filter('translate')('@user');
      } else {
        entity.type = 'privategroups';
        entity.typeCategory = $filter('translate')('@common-topics');
      }

      EntityMapManager.add('total', entity);
    });
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
