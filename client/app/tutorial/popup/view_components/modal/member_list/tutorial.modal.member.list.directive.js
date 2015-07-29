/**
 * @fileoverview 튜토리얼 DM 리스트 모달 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialModalMemberList', tutorialModalMemberList);

  function tutorialModalMemberList() {
    return {
      link: link,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/modal/member_list/tutorial.modal.member.list.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
