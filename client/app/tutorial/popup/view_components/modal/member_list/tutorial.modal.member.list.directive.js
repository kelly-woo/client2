/**
 * @fileoverview 튜토리얼 가이드 레이어 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialModalMemberList', tutorialModalMemberList);

  function tutorialModalMemberList() {
    return {
      link: link,
      scope: {
        top: '=',
        left: '=',
        hasSkip: '=',
        step: '=',
        title: '=',
        content: '='
      },
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/modal/member_list/tutorial.modal.member.list.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
