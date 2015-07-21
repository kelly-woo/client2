/**
 * @fileoverview 튜토리얼 completion 모달 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialCompletion', tutorialCompletion);

  function tutorialCompletion() {
    return {
      link: link,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/completion/tutorial.completion.html',
      controller: 'tutorialCompletionCtrl',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
      var jqDimm = $('.tutorial_dimm');
      if (jqDimm.length) {
        jqDimm.addClass('full');
      } else {
        jqDimm = $('<div class="tutorial_dimm full"></div>');
        element.append(jqDimm);
      }
    }
  }
})();
