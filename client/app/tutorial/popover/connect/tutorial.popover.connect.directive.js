/**
 * @fileoverview 커넥트 튜토리얼 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialPopoverConnect', tutorialPopoverConnect);

  function tutorialPopoverConnect() {
    return {
      link: link,
      scope: {},
      restrict: 'E',
      controller: 'TutorialPopoverConnectCtrl',
      templateUrl: 'app/tutorial/popover/connect/tutorial.popover.connect.html'
    };

    function link(scope, el, attrs) {
    }
  }
})();
