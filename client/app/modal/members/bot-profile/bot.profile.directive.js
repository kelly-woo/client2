/**
 * @fileoverview bot profile dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('botProfile', botProfile);

  function botProfile($filter, JndUtil, memberService, fileAPIservice, Dialog) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el) {
      var timerHideDmSubmit;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onSubmitDoneClick = onSubmitDoneClick;
        scope.setShowDmSubmit = setShowDmSubmit;
      }

      /**
       * submit done click event handler
       */
      function onSubmitDoneClick() {
        setShowDmSubmit(false);
        _focusInput();
      }

      /**
       * dm 입력란 상태 설정
       * @param {boolean} value
       */
      function setShowDmSubmit(value) {
        var jqMessageSubmit = el.find('.message-submit-bg');
        var jqMessageInput = el.find('.form-control');

        clearTimeout(timerHideDmSubmit);
        scope.isShowDmSubmit = value;
        if (value) {
          jqMessageInput.blur();
          jqMessageSubmit.show();
        } else {
          timerHideDmSubmit = setTimeout(function() {
            jqMessageInput.focus();
            jqMessageSubmit.hide();
          }, 200);
        }
      }

      /**
       * input에 focus
       * @private
       */
      function _focusInput() {
        var jqInput = el.find('.form-control');

        jqInput.focus();
      }
    }
  }
})();
