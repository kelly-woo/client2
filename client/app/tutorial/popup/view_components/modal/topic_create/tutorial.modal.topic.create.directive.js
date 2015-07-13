/**
 * @fileoverview 튜토리얼 가이드 레이어 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialModalTopicCreate', tutorialModalTopicCreate);

  function tutorialModalTopicCreate() {
    return {
      link: link,
      scope: false,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/modal/topic_create/tutorial.modal.topic.create.html',
      restrict: 'E',
      controller: 'tutorialModalTopicCreateCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();
