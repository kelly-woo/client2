/**
 * @fileoverview team member item directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('teamMemberListTemplate', teamMemberListTemplate);

  function teamMemberListTemplate() {
    return {
      restrict: 'EA',
      replace: true,
      scope: true,
      link: link,
      templateUrl: 'app/modal/teams/team_member_list/team_member_list_template/team.member.list.tpl.html',
      controller: 'TeamMemberListTemplateCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();
