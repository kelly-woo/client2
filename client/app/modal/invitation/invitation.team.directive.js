(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('invitationModal', invitationModal);

  function invitationModal($http, $filter, invitationService, teamAPIservice, configuration, memberService, clipboard) {
    var clip =
    console.log('clip ::: ', clip);

    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element, attrs) {
      var emailPlaceholder = $filter('translate')('@input-invite-email');
      var someFailInvite = 'Some fail';
      var allIFailInvite = 'All fail';
      var invitation;

      if (!scope.inviteDisabled) {
        clipboard.createInstance(element.find('.clip-invite'), {
          getText: function() {
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
              item.append('<div class="modal-noti-block_msg alert-jandi alert-danger"><span>' + emailPlaceholder + '</span><div>');

              if (ele.parent().find('.alert-danger').length > 0) {
                invitation.ele.parent().children('.send-invite').addClass('disabled');
              }
            },
            onValidFormat: function (ele) {
              ele.parent().children('div').remove();

              if (ele.parent().find('.alert-danger').length === 0) {
                invitation.ele.parent().children('.send-invite').removeClass('disabled');
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

              body.children('.invite-btn').remove();
              footer.addClass('invite-done');

              if (successCnt === 0) {
                msg = allIFailInvite;
              } else if (successCnt !== totalCnt) {
                msg = someFailInvite;
              }

              if (msg) {
                body.append(
                  '<div class="modal-noti-block_msg alert-jandi alert-danger"><span>' + msg + '</span><div>'
                );
              }

              footer.html(
                '<div class="done-content">' +
                  (!!successCnt ? '<img src="' + scope.doneImage + '">' : '') +   // 하나도 성공하지 못함
                  '<div class="done-invite invite-btn cursor_pointer btn-ok">' +
                    '<span translate>Done</span>' +
                  '</div>' +
                '</div>'
              );

              footer.find('.done-invite').on('click', function() {
                scope.cancel();
              });

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