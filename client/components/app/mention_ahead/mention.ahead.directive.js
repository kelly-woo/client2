/**
 * @fileoverview mention ahead directive
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .directive('mentionahead', mentionahead);

  /* @ngInject */
  function mentionahead($rootScope, $compile, currentSessionHelper, entityAPIservice) {

    return {
      restrict: 'A',
      require: ['mentionahead'],
      controller: 'MentionaheadCtrl',
      compile: function() {
        var mentionScope;
        var mentionahead;

        mentionScope = $rootScope.$new(true);
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
          mentionScope.eventCatcher = el;
          jqMentionahead = mentionahead(mentionScope, function (jqMentionahead) {
            el.parent().append(jqMentionahead);
          });

          mentionCtrl
            .init({
              originScope: scope,
              mentionScope: mentionScope,
              mentionModel: jqMentionahead.data('$ngModelController'),
              jqEle: el,
              attrs: attrs,
              on: function() {
                // text change event handling
                function changeHandler(event) {
                  var value = event.target.value;

                  if (value !== mentionCtrl.getValue()) {
                    mentionCtrl.setValue(value);
                  }
                }

                function liveSearchHandler() {
                  mentionCtrl.setMentionLive();
                  mentionCtrl.showMentionahead();
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