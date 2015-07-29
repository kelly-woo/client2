'use strict';

var app = angular.module('jandiApp');

app.factory('leftpanelAPIservice', function($http, $rootScope, $state, $filter, storageAPIservice, memberService,
                                            currentSessionHelper) {
  var leftpanelAPI = {};

  leftpanelAPI.getLists = function() {
    return $http({
      method: 'GET',
      url: $rootScope.server_address + 'leftSideMenu',
      params: {
        teamId: memberService.getTeamId()
      }
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
    var joinedChannelMap = {};
    var privateGroupList = [];
    var privateGroupMap = {};

    angular.forEach(array, function(entity, index) {
      var type = entity.type;
      if (type == "channels") {
        joinedChannelList.push(entity);
        joinedChannelMap[entity.id] = entity;
      } else if (type == "privategroups") {
        privateGroupList.push(entity);
        privateGroupMap[entity.id] = entity;
      }
    });

    return {
      joinedChannelList: joinedChannelList,
      joinedChannelMap: joinedChannelMap,
      privateGroupList: privateGroupList,
      privateGroupMap: privateGroupMap
    };
  };

  leftpanelAPI.getDefaultChannel = function(input) {
    return input.team.t_defaultChannelId;
  };

  leftpanelAPI.getGeneralData = function(totalEntities, joinedEntities, currentUserId) {
    var memberList = [];
    var memberMap = {};
    var totalChannelList = [];
    var unJoinedChannelList = [];

    angular.forEach(totalEntities, function(entity, index) {
      var entityId = entity.id;
      var entityType = entity.type;

      if (entityType == "users") {
        if (currentUserId != entityId) {
          entity.selected = false;
          memberList.push(entity);
          memberMap[entityId] = entity;
        }
      }
      else if (entityType == "channels") {
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
      memberMap: memberMap,
      totalChannelList: totalChannelList,
      unJoinedChannelList: unJoinedChannelList
    };
  };

  // TODO: REFACTOR | TO entityAPIservice - LOGIC ONLY.
  //  Initialize correct prefix for 'channel' and 'user'.

  // prefix 는 select dropdown 에서 분류의 목적으로 사용된다.
  leftpanelAPI.setEntityPrefix = function($scope) {
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
    });
  };

  return leftpanelAPI;
});
