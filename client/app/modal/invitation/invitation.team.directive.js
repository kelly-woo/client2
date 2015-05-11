(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('invitationModal', invitationModal);

  function invitationModal($http, $filter, invitationService, teamAPIservice, configuration, memberService, clipboard) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element, attrs) {
      scope.isCopySuccess = false;

      var emailPlaceholder = $filter('translate')('@common-email');
      var done = $filter('translate')('@common-done');
      var invalidEmail = $filter('translate')('@invitation-invaild-email');
      var someFail = $filter('translate')('@invitation-some-fail');

      var invitation;
      var clipButton;

      if (!scope.inviteDisabled) {
        clipButton = element.find('.clip-invite');
        clipButton
          .on('mousedown', function () {
            clipButton.addClass('active');
          })
          .on('mouseup', function () {
            clipButton.removeClass('active');
          })
          .on('mouseleave', function () {
            clipButton.removeClass('active');
          });

        clipboard.createInstance( clipButton, {
          getText: function() {
            scope.isCopySuccess = true;
            return element.find('#invite-link').val();
          }
        });

        invitation = scope.invitation = Object.create(invitationService).init(
          element.find('#invites'),
          {
            inviteFn: teamAPIservice.inviteToTeam,
            templateItem: '<div class="form-horizontal invite-body-form-control" style="position: relative;">' +
              '<input type="email" class="form-control invite" name="email" placeholder="' + emailPlaceholder + '" ng-required="true" />' +
            '</div>',
            onInvalidFormat: function(ele) {
              var item = ele.parent();

              item.children('div').remove();
              item.append('<div class="modal-noti-block_msg alert-jandi alert-danger"><span>' + invalidEmail + '</span><div>');

              if (ele.parents('#invites').find('.alert-danger').length > 0) {
                invitation.ele.parent().children('.send-invite').addClass('disabled');
              }
            },
            onValidFormat: function (ele) {
              ele.parent().children('div').remove();

              if (invitation.length === invitation.getEmptyInputBox().length) {           // 모든 input에 아무값 입력되지 않은 상태
                invitation.ele.parent().children('.send-invite').addClass('disabled');
              } else if (ele.parents('#invites').find('.alert-danger').length === 0) {
                invitation.ele.parent().children('.send-invite').removeClass('disabled'); // 특정 input에 경고 메시지 나온 상태
              }
            },
            onBeforeSend: function(event) {
              if (scope.isLoading || event.delegateTarget.className.indexOf('disabled') > -1) return false;

              scope.toggleLoading();
            },
            onAfterSend: function(ele, successCnt, totalCnt) {
              var body = ele.parent();
              var footer = body.parent().children('.modal-footer');
              var msg;
              var emptys;
              var i, len;

              body.children('.invite-btn').remove();
              footer.addClass('invite-done');

              // 부분 실패
              if (successCnt !== totalCnt) {
                msg = someFail;
              }

              if (msg) {
                body.append(
                  '<div class="modal-noti-block_msg alert-jandi alert-danger"><span>' + msg + '</span><div>'
                );
              }

              footer.html(
                '<div class="done-content">' +
                  (!!successCnt ? '<img src="' + scope.doneImage + '">' : '') +   // 하나도 성공하지 못함
                  '<div class="done-invite invite-btn cursor_pointer btn-ok btn">' +
                    '<span translate>' + done +'</span>' +
                  '</div>' +
                '</div>'
              );

              footer.find('.done-invite').on('click', function() {
                scope.cancel();
              });

              if (emptys = invitation.getEmptyInputBox()) {
                for (i = 0, len = emptys.length; i < len; ++i) {
                  $(emptys[i]).parent().remove();
                }
              }

              scope.toggleLoading();
            },
            onDuplicate: function(ele) {
              // console.log('duplicate ::: ', ele);
            },
            onSuccess: function(ele) {
              // console.log('success ::: ', ele);
            }
          }
        );
      }
    }
  }
})();