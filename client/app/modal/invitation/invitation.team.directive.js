(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('invitationModal', invitationModal);

  function invitationModal($http, $filter, invitationService, teamAPIservice, configuration, memberService) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element, attrs) {
      var emailPlaceholder = $filter('translate')('@input-invite-email');

      if (!scope.inviteDisabled) {
        scope.invitation = Object.create(invitationService).init(
          element.find('#invites'),
          {
            inviteFn: teamAPIservice.inviteToTeam,
            templateItem: '<div class="form-horizontal invite-body-form-control" style="position: relative;">' +
              '<input type="email" class="form-control invite" name="email" placeholder="' + emailPlaceholder + '" ng-required="true" />' +
            '</div>',
            onInvalidFormat: function(ele) {
              var parent = ele.parent();

              parent.children('div').remove();
              parent.append('<div class="modal-noti-block_msg alert-jandi alert-danger"><span>' + emailPlaceholder + '</span><div>');
            },
            onValidFormat: function (ele) {
              ele.parent().children('div').remove();
            },
            onSend: function(ele) {
              var body = ele.parent();
              var footer = body.parent().children('.modal-footer');

              body.children('.invite-btn').remove();

              footer.addClass('invite-done');
              footer.html(
                '<div class="done-content">' +
                  '<img src="' + scope.doneImage + '">' +
                  '<div class="done-invite invite-btn cursor_pointer btn-ok" ng-click="done();">' +
                    '<span translate>Done</span>' +
                  '</div>' +
                '</div>'
              );
            },
            onDuplicate: function(ele) {
              console.log('duplicate ::: ', ele);
            },
            onSuccess: function(ele) {
              console.log('success ::: ', ele);
            }
          }
        );
      }
    }
  }
})();