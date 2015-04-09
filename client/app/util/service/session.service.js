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
  function currentSessionHelper($rootScope) {

    var currentTeam = $rootScope.team;
    var currentTeamMemberList = $rootScope.memberList;

    this.getCurrentTeam = getCurrentTeam;
    this.setCurrentTeam = setCurrentTeam;

    this.isDefaultTopic = isDefaultTopic;
    this.getDefaultTopicId = getDefaultTopicId;


    this.getCurrentTeamMemberList = getCurrentTeamMemberList;
    this.setCurrentTeamMemberList = setCurrentTeamMemberList;

    this.getCurrentTeamMemberCount = getCurrentTeamMemberCount;



    function getCurrentTeam() { return currentTeam; }
    function setCurrentTeam(team) { currentTeam = team; }

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



  }
})();