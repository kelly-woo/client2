/**
 * @fileoverview team invite modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('invitationModal', invitationModal);

  function invitationModal($filter, clipboard) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el) {
      var done = $filter('translate')('@common-done');

      var jqInviteButton = el.find('#team-invite-btn');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _on();

        if (!scope.inviteDisabled) {
          // 팀초대가 활성화 되어 있음

          scope.setInviteBtnText = setInviteBtnText;
          setInviteBtnText([]);

          scope.isCopySuccess = false;
          _setClipBtn();
        }
      }

      /**
       * on listeners
       * @private
       */
      function _on() {
        el.on('click', _onClick);
      }

      /**
       * click event handler
       * @private
       */
      function _onClick() {
        $('#email-input').focus();
      }

      /**
       * 초대 메일 보내기 버튼 설정함.
       * @param {array} $list
       */
      function setInviteBtnText($list) {
        var length =  $list.length;
        if (length > 0) {
          jqInviteButton.removeAttr('disabled').removeClass('disabled');
        } else {
          jqInviteButton.attr('disabled', true).addClass('disabled');
        }
        jqInviteButton.text($filter('translate')('@team-invite-send').replace('{{inviteeNumber}}', length));
      }

      /**
       * 클립보드에 URI 붙여넣기하는 버튼 설정함.
       * @private
       */
      function _setClipBtn() {
        var jqClipButton = el.find('.clip-invite');

        jqClipButton
          .on('mousedown', function () {
            jqClipButton.addClass('active');
          })
          .on('mouseup', function () {
            jqClipButton.removeClass('active');
          })
          .on('mouseleave', function () {
            jqClipButton.removeClass('active');
          });

        if (!scope.disableSeedUri) {
          clipboard.createInstance(jqClipButton, {
            getText: function() {
              scope.isCopySuccess = true;
              return el.find('#invite-link').val();
            }
          });
        }
      }
    }
  }
})();
