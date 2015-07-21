/**
 * @fileoverview 튜토리얼 토픽 리스트 모달 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialModalTopicList', tutorialModalTopicList);

  function tutorialModalTopicList() {
    return {
      link: link,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/modal/topic_list/tutorial.modal.topic.list.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
