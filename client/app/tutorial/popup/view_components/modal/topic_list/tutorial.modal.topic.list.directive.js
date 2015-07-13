/**
 * @fileoverview 튜토리얼 가이드 레이어 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialModalTopicList', tutorialModalTopicList);

  function tutorialModalTopicList() {
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
      templateUrl: 'app/tutorial/popup/view_components/modal/topic_list/tutorial.modal.topic.list.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
