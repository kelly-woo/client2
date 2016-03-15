/**
 * @fileoverview email을 사용한 팀 초대 directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('inviteEmails', inviteEmails);

  function inviteEmails($parse, jndKeyCode) {
    return {
      replace: true,
      restrict: 'A',
      link: link,
      templateUrl: 'app/modal/teams/team_invite/invite_emails/invite.emails.html'
    };

    function link(scope, el, attrs) {
      // invite list change callback
      var onChangeInviteList = $parse(attrs.onChangeInviteList);

      // invite list model name
      var inviteEmailsModel = attrs.inviteEmailsModel;

      // invite interface 활성화 flag
      var active = attrs.active;

      var jqEmailInput = $('#email-input');
      var regxEmail = /^([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      var regxEmailSplit = /[\s,]/;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.emails = scope[inviteEmailsModel] = [];
        scope.invalidEmails = [];
        scope.removeEmail = removeEmail;

        _on();
      }

      /**
       * on listeners
       * @private
       */
      function _on() {
        scope.$watch(active, _onActive);
        scope.$on('invitationModal:emailsInsert', function() {
          _insertEmail(jqEmailInput.val());
        });

        jqEmailInput
          .on('paste', _onPaste)
          .on('keyup', _onKeyUp)
          .on('blur', _onBlur);
      }

      /**
       * invite interface 활성화 event handler
       * @param {boolean} newValue
       * @param {boolean} oldvalue
       * @private
       */
      function _onActive(newValue, oldValue) {
        if (newValue !== oldValue && !newValue) {
          scope.emails = scope[inviteEmailsModel] = [];
          scope.invalidEmails = [];

          _setInputEmails(scope.invalidEmails);
          onChangeInviteList(scope, {
            $list: scope.emails
          });

          setTimeout(function() {
            jqEmailInput.focus();
          }, 50);
        }
      }

      /**
       * paste event handler
       * @param {object} event
       * @private
       */
      function _onPaste(event) {
        var text = event.originalEvent.clipboardData.getData('Text');
        var value = jqEmailInput.val();
        var element = jqEmailInput[0];

        event.preventDefault();

        value = value.substring(0, element.selectionStart) + text + value.substring(element.selectionEnd, value.length);

        _insertEmail(value);
      }
  
      /**
       * keyup event handler
       * @param {object} event
       * @private
       */
      function _onKeyUp(event) {
        var which = event.which;
        var value;

        if ((!event.metaKey && !event.ctrlKey && jndKeyCode.match('ENTER', which))
          || jndKeyCode.match('SPACE', which) || jndKeyCode.match('CHAR_COMMA', which)) {
          value = jqEmailInput.val();
          _insertEmail(value);
        }
      }
  
      /**
       * blur event handler
       * @private
       */
      function _onBlur() {
        var value = jqEmailInput.val();

        _insertEmail(value);
      }
  
      /**
       * email 입력함.
       * @param {string} value
       * @private
       */
      function _insertEmail(value) {
        var emails = scope.emails;
        var length = emails.length;
        var list = value.split(regxEmailSplit);
        var invalidEmails = scope.invalidEmails = [];

        _.forEach(list, function(item) {
          if (item !== '') {
            if (!regxEmail.test(item)) {
              invalidEmails.push(item);
            } else if (emails.indexOf(item) < 0) {
              emails.push(item);
            }
          }
        });

        if (length !== emails.length) {
          onChangeInviteList(scope, {
            $list: scope.emails
          });
        }

        _setInputEmails(invalidEmails);
        scope.$digest();
      }

      /**
       * email 삭제함.
       * @param {string} email
       */
      function removeEmail(email) {
        var index;

        if (email == null) {
          scope.emails.splice(0);
        } else {
          index = scope.emails.indexOf(email);
          if (index > -1) {
            scope.emails.splice(index, 1);
          }
        }

        onChangeInviteList(scope, {
          $list: scope.emails
        });

        setTimeout(function() {
          jqEmailInput.focus();
        }, 50);
      }

      /**
       * email input element에 value 설정함.
       * @param invalidEmails
       * @private
       */
      function _setInputEmails(invalidEmails) {
        var value = invalidEmails.join(' ');
        //value += (value !== '' && value.charAt(value.length - 1) !== ' ' ? ' ' : '');
        jqEmailInput.val(value);
      }
    }
  }
})();
