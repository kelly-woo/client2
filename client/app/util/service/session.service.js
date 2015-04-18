/**
 *
 *
 * Keep tracks of every information that is bounded to current session!!!!
 *
 * Let's move things to here from $rootScope
 *
 *
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('currentSessionHelper', currentSessionHelper);

  /* @ngInject */
  function currentSessionHelper() {

    var currentTeam;
    var currentTeamMemberList;
    var currentEntity;

    var isSocketConnected = false;


    this.getCurrentTeam = getCurrentTeam;
    this.setCurrentTeam = setCurrentTeam;

    this.updateCurrentTeamName = updateCurrentTeamName;

    this.isDefaultTopic = isDefaultTopic;
    this.getDefaultTopicId = getDefaultTopicId;


    this.getCurrentTeamMemberList = getCurrentTeamMemberList;
    this.setCurrentTeamMemberList = setCurrentTeamMemberList;

    this.getCurrentTeamMemberCount = getCurrentTeamMemberCount;

    this.setCurrentEntity = setCurrentEntity;
    this.getCurrentEntity = getCurrentEntity;

    this.setSocketConnection = setSocketConnection;
    this.resetSocketConnection = resetSocketConnection;
    this.getSocketConnection = getSocketConnection;



    function getCurrentTeam() { return currentTeam; }
    function setCurrentTeam(team) { currentTeam = team; }

    function _setCurrentTeamName(teamName) {
      currentTeam.name = teamName;
    }

    function updateCurrentTeamName(teamName) {
      _setCurrentTeamName(teamName);
    }

    function isDefaultTopic(topic) {
      return topic.id == getDefaultTopicId();
    }

    function getDefaultTopicId() {
      return currentTeam.t_defaultChannelId;
    }
    function getCurrentTeamMemberList() { return currentTeamMemberList; }
    function setCurrentTeamMemberList(memberList) { currentTeamMemberList = memberList; }

    function getCurrentTeamMemberCount() {
      var activeMemberCount = 0;
      _.forEach(currentTeamMemberList, function(member, index) {
        //console.log(currentTeamMemberList)
        if (member.status == 'enabled') activeMemberCount++;
      });

      //console.log(activeMemberCount)
      return activeMemberCount;
    }

    function setCurrentEntity(entity) {
      currentEntity = entity;
    }

    function getCurrentEntity() {
      return currentEntity;
    }

    function setSocketConnection() {
      isSocketConnected = true;
    }
    function resetSocketConnection() {
      isSocketConnected = false;
    }

    function getSocketConnection() {
      return isSocketConnected;
    }





  }
})();