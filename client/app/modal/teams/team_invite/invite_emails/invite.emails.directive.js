(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('inviteEmails', inviteEmails);

  function inviteEmails() {
    return {
      replace: true,
      restrict: 'A',
      link: link,
      templateUrl: 'app/modal/teams/team_invite/invite_emails/invite.emails.html'
    };

    function link(scope, element) {
      var jqEmailInput = $('#email-input');
      var jqInviteEmailList = $('.invite-email-list');

      _on();

      function _on() {
        jqEmailInput
          .on('paste', _onPaste)
          .on('keypress', _onKeyPress);
      }

      function _onPaste(event) {
        var data = event.originalEvent.clipboardData.getData('Text');
        var value = _getValue(event, data);

        console.log('on paste ::: ', value, event.target.value);
      }

      function _onKeyPress(event) {
        var char = String.fromCharCode(event.which);
        var value = _getValue(event, char);

        console.log('on change ::: ', event, value);
      }

      function _getValue(event, input) {
        var element = event.target;
        var value = element.value;

        return value.substring(0, element.selectionStart) + input + value.substring(element.selectionEnd, value.length);
      }
    }
  }
})();
