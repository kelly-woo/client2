/**
 * @fileoverview mention ahead directive
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .directive('mentionahead', mentionahead);

  /* @ngInject */
  function mentionahead($compile, $timeout, $position, currentSessionHelper, memberService) {

    return {
      restrict: 'A',
      scope: true,
      require: ['mentionahead'],
      controller: 'MentionaheadCtrl',
      compile: function() {
        var mentionahead;

        mentionahead = $compile(
          '<div type="text" style="position: absolute; top: 0; left: 0; width: 100%;" ' +
          'jandi-typeahead="mention.name for mention in mentionList | filter: { extSearchName: $viewValue }"' +
          'jandi-typeahead-prevent-default-placement="true" ' +
          'jandi-typeahead-on-select="onSelect($item)" ' +
          'jandi-typeahead-on-matches="onMatches($matches)" ' +
          'jandi-typeahead-template-name="jandi-mentionahead-popup" ' +
          'jandi-typeahead-min-Length="0" ' +
          'ng-model="mentionModel" ></div>'
        );

        return function(scope, el, attrs, ctrls) {
          var currentEntity = currentSessionHelper.getCurrentEntity();

          var mentionCtrl;
          var jqMentionahead;

          if (currentEntity && !memberService.isMember(currentEntity.id)) {
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
                  var LIVE_SEARCH_DELAY = 0;
                  var timerLiveSearch;

                  // text change event handling
                  function changeHandler(event) {
                    var value = event.target.value;

                    if (value !== mentionCtrl.getValue()) {
                      mentionCtrl.setValue(value);
                    }
                  }

                  // 실시간 mention 입력 확인
                  function liveSearchHandler(event) {
                    $timeout.cancel(timerLiveSearch);
                    timerLiveSearch = $timeout(function() {
                      var jqPopup = jqMentionahead.next();
                      var css;

                      mentionCtrl.setMentionOnLive(event);
                      mentionCtrl.showMentionahead();

                      // mention ahead position
                      css = $position.positionElements(jqMentionahead, jqPopup, 'top-left', false);
                      jqPopup.css(css);
                    }, LIVE_SEARCH_DELAY);
                  }

                  el
                    .on('input', changeHandler)
                    .on('click', function (event) {
                      event.stopPropagation();
                      liveSearchHandler(event);
                    })
                    //.on('blur', mentionCtrl.clearMention)
                    .on('keyup', liveSearchHandler);
                }
              });
          }
        }
      }
    };
  }
}());
