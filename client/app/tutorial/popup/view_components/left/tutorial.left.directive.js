/**
 * @fileoverview 튜토리얼 왼쪽 패널 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialLeft', tutorialLeft);

  function tutorialLeft() {
    return {
      link: link,
      scope: {
        topicList: '=topicList',
        dmList: '=dmList'
      },
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/left/tutorial.left.html',
      controller: 'tutorialLeftCtrl',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
