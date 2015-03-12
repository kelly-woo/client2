(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('teamMemberListTemplate', teamMemberListTemplate);

  function teamMemberListTemplate() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      templateUrl: 'app/modal/team_member_list/team_member_list_template/team.member.list.tpl.html',
      controller: 'teamMemberListTemplateCtrl'
    };

    function link(scope, element, attrs) {

    }
  }

})();