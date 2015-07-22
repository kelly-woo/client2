/**
 * @fileoverview mention ahead directive
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .directive('mentionAhead', mentionAhead);

  /* @ngInject */
  function mentionAhead($rootScope, $templateRequest, $compile, jndKeyCode) {

    return {
      restrict: 'A',
      require: ['mentionAhead'],
      controller: 'MentionAheadController',
      compile: function(target) {
        var mentionScope = $rootScope.$new(true);
        var mentionAhead = $compile(
          '<div type="text" style="position: absolute; top: 0; left: 0; width: 100%;" ' +
            'jandi-typeahead="mention as mention.name for mention in mentionList | filter:{ exNameMention: $viewValue }" ' +
            'jandi-typeahead-placement="top" ' +
            'jandi-typeahead-append-to-body="true" ' +
            'jandi-typeahead-on-select="onSelect()" ' +
            'jandi-typeahead-template-name="jandi-mentionahead-popup" ' +
            'ng-model="mentionModel" ></div>'
        );
        var isShowMentionAhead;

        return function(scope, el, attrs, ctrls) {
          var mentionCtrl = ctrls[0];
          var jqMentionAhead;
          var mentionModel;

          mentionScope.eventCatcher = el;
          jqMentionAhead = mentionAhead(mentionScope, function(jqMentionAhead) {
            el.parent().append(jqMentionAhead);
          });
          mentionModel = jqMentionAhead.data('$ngModelController');

          mentionCtrl.init(scope, mentionScope, mentionModel, el);

          el
            .on('input', changeHandler)
            .on('keyup', liveHandler);

          if (attrs.messageSubmit) {
            _hookMessageSubmit(attrs.messageSubmit);
          }


          // text change event handling
          function changeHandler(event) {
            var value = event.target.value;

            if (value !== mentionCtrl.getValue()) {
              mentionCtrl.setValue(value);
            }
          }

          function liveHandler(event) {
            mentionCtrl.setMentionLive();
            if (mentionCtrl.hasMentionLive()) {
              mentionCtrl.showMentionAhead();
            }
          }

          function _hookMessageSubmit(originMessageSubmit) {
            originMessageSubmit

            if (originMessageSubmit) {
              attrs.messageSubmit = function() {
                if (!mentionCtrl.hasMentionLive()) {
                  scope.$eval(originMessageSubmit)
                }
              };
            }
          }


        }
      }
    };
  }
}());
