(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('HelpMessageCtrl', HelpMessageCtrl);

  /* @ngInject */
  function HelpMessageCtrl($scope, $rootScope, $filter) {

    (function() {
      _init();
    })();

    $scope.$on('onEntityMessageStatusChanged', function(event) {
      _init();
    });

    function _init() {
      _getCurrentHelpState();
    }


    function _getCurrentHelpState() {
      if ($scope.hasNoFilesUpload) {
        // HAS_NO_FILES_UPLOADED;
        _createTemplate(
          'help-upload-a-file',
          $filter('translate')('@your-file-drawer-is-empty-heading'),
          $filter('translate')('@click-to-share-file'),
          true,
          $filter('translate')('@common-upload-file'),
          _openFileUploadModal
        );

      } else if ($scope.isLonelyPerson) {
        // HOME_ALONE;
        _createTemplate(
          'help-invite-members',
          $filter('translate')('@you-are-all-alone-heading'),
          $filter('translate')('@click-to-invite-to-current-topic'),
          true,
          $filter('translate')('@btn-invite'),
          _openInviteModal
        );
      } else {
        // NEED_TO_TALK;
        _createTemplate(
          'help-enter-a-message',
          $filter('translate')('@start-chatting-heading'),
          '',
          false,
          '',
          _setChatInputBoxFocus
        );
      }
    }


    function _createTemplate(imageClass, heading, message, isButtonRequired, buttonText, actionFunction) {
      var helpMessages = {};
      helpMessages.heading = heading;
      helpMessages.message = message;
      $scope.helpMessages = helpMessages;

      $scope.helpImageClass = imageClass;

      $scope.isButtonRequired = isButtonRequired;
      $scope.helpButtonText = buttonText;

      $scope.onButtonClicked = actionFunction;
    }

    function _openInviteModal() {
      $scope.openModal('invite');
    }

    function _setChatInputBoxFocus() {
      $rootScope.$broadcast('setChatInputFocus');
    }

    function _openFileUploadModal(event) {
      $('#btn-upload-primary').trigger('click');
    }

  }
})();