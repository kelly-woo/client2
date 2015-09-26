(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('invitationModal', invitationModal);

  function invitationModal($filter, $timeout, invitationService, teamAPIservice, clipboard) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      scope.isCopySuccess = false;

      //var emailPlaceholder = $filter('translate')('@common-email');
      var done = $filter('translate')('@common-done');
      //var invalidEmail = $filter('translate')('@invitation-invaild-email');
      //var someFail = $filter('translate')('@invitation-some-fail');
      //var alreadyMember = $filter('translate')('@invitation-already-member');
      //
      //var hasDuplicate;

      //var invitation;
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

        if (!scope.disableSeedUri) {
          clipboard.createInstance(clipButton, {
            getText: function() {
              scope.isCopySuccess = true;
              return element.find('#invite-link').val();
            }
          });
        }
      }
    }
  }
})();
