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
    var templateUrl = 'components/app/mention_ahead/mention.ahead.html';
    var mentionAheadTemplate;

    $templateRequest(templateUrl)
      .then(function(template) {
        mentionAheadTemplate = template;
      });

    return {
      restrict: 'A',
      require: ['mentionAhead'],
      controller: 'MentionAheadController',
      compile: function(target) {
        var mentionScope = $rootScope.$new(true);
        var mentionAhead = $compile(
          '<div type="text" style="position: absolute; top: 0; left: 0; width: 100%;" ' +
            'jandi-typeahead="mention as mention.name for mention in mentionList | filter:{ name: $viewValue }" ' +
            'jandi-typeahead-placement="top" ' +
            'jandi-typeahead-append-to-body="true" ' +
            'jandi-typeahead-on-select="onSelect()" ' +
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

          _hookMessageSubmit(attrs.messageSubmit);

          // text change event handling
          function changeHandler(event) {
            var value = event.target.value;

            if (value !== mentionCtrl.getValue()) {
              mentionCtrl.setValue(value);
            }
          }

          function liveHandler(event) {
            var selection = mentionCtrl.selection();
            var mention;

            if (mention = mentionCtrl.getMentionLive(selection.begin)) {
              isShowMentionAhead = true;

              mentionCtrl.showMentionAhead(mention);
            } else {
              isShowMentionAhead = false;
            }
          }

          function _hookMessageSubmit(originMessageSubmit) {
            if (originMessageSubmit) {
              attrs.messageSubmit = function() {
                if (isShowMentionAhead) {
                  console.log( 'message submit ::: ', mentionModel.$viewValue );
                } else {
                  originMessageSubmit.call(scope);
                }
              };
            }
          }


        }
      }
    };
  }
}());
