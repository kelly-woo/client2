/**
 * @fileoverview mention ahead directive
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .directive('mentionahead', mentionahead);

  /* @ngInject */
  function mentionahead($compile, $timeout) {

    return {
      restrict: 'A',
      scope: true,
      require: ['mentionahead'],
      controller: 'MentionaheadCtrl',
      compile: function() {
        var mentionahead;

        mentionahead = $compile(
          '<div type="text" style="position: absolute; top: 0; left: 0; width: 100%;" ' +
          'jandi-typeahead="mention as mention.name for mention in mentionList | userByName: $viewValue" ' +
          'jandi-typeahead-placement="top-left" ' +
          'jandi-typeahead-on-select="onSelect($item)" ' +
          'jandi-typeahead-on-matches="onMatches($matches)" ' +
          'jandi-typeahead-template-name="jandi-mentionahead-popup" ' +
          'jandi-typeahead-min-Length="0" ' +
          'ng-model="mentionModel" ></div>'
        );

        return function(scope, el, attrs, ctrls) {
          var mentionCtrl;
          var jqMentionahead;

          mentionCtrl = ctrls[0];
          scope.eventCatcher = el;
          jqMentionahead = mentionahead(scope, function (jqMentionahead) {
            el.parent().append(jqMentionahead);
          });

          mentionCtrl
            .init({
              originScope: scope.$parent,
              mentionModel: jqMentionahead.data('$ngModelController'),
              jqEle: el,
              attrs: attrs,
              on: function() {
                var LIVE_SEARCH_DELAY = 50;
                var timerLiveSearch;

                // text change event handling
                function changeHandler(event) {
                  var value = event.target.value;

                  if (value !== mentionCtrl.getValue()) {
                    mentionCtrl.setValue(value);
                  }
                }

                // 실시간 mention 입력 확인
                function liveSearchHandler() {
                  $timeout.cancel(timerLiveSearch);
                  timerLiveSearch = $timeout(function() {
                    mentionCtrl.setMentionOnLive();
                    mentionCtrl.showMentionahead();
                  }, LIVE_SEARCH_DELAY);
                }

                el
                  .on('input', changeHandler)
                  .on('click', function (event) {
                    event.stopPropagation();
                    liveSearchHandler();
                  })
                  .on('blur', mentionCtrl.clearMention)
                  .on('keyup', liveSearchHandler);
              }
            });
        }
      }
    };
  }
}());
