(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('HelpMessageCtrl', HelpMessageCtrl);

  /* @ngInject */
  function HelpMessageCtrl($scope, $rootScope, $filter, publicService, modalHelper) {

    // TODO: TO CONFIG??
    var NO_MEMBER_IN_TEAM = 'NO_MEMBER_IN_TEAM';
    var NO_MEMBER_IN_TOPIC = 'NO_MEMBER_IN_TOPIC';
    var NO_FILES_UPLOADED = 'NO_FILES_UPLOADED';
    var NO_CONVERSATION_IN_TOPIC = 'NO_CONVERSATION_IN_TOPIC';

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
      var state = $scope.currentState;

      switch (state) {
        case NO_MEMBER_IN_TEAM:
          _createTemplate(
            'help-invite-members',
            $filter('translate')('@no-team-member-joined'),
            $filter('translate')('@click-to-invite-to-current-team'),
            true,
            $filter('translate')('@btn-invite'),
            _openInviteToTeamModal
          );
          break;
        case NO_MEMBER_IN_TOPIC:
          _createTemplate(
            'help-invite-members',
            $filter('translate')('@you-are-all-alone-heading'),
            $filter('translate')('@click-to-invite-to-current-topic'),
            true,
            $filter('translate')('@btn-invite'),
            _openInviteModal
          );
          break;
        case NO_FILES_UPLOADED:
          _createTemplate(
            'help-upload-a-file',
            $filter('translate')('@your-file-drawer-is-empty-heading'),
            $filter('translate')('@click-to-share-file'),
            true,
            $filter('translate')('@common-upload-file'),
            _openFileUploadModal
          );
          break;
        case NO_CONVERSATION_IN_TOPIC:
          _createTemplate(
            'help-enter-a-message',
            $filter('translate')('@start-chatting-heading'),
            '',
            false,
            '',
            _setChatInputBoxFocus
          );
          break;


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


    function _openInviteToTeamModal() {
      modalHelper.closeModal();
      modalHelper.openInviteToTeamModal();
    }
    function _openInviteModal() {
      modalHelper.openInviteToCurrentEntityModal();
    }

    function _setChatInputBoxFocus() {
      $rootScope.$broadcast('setChatInputFocus');
    }

    function _openFileUploadModal(event) {
      $('#btn-upload-primary').trigger('click');
    }

  }
})();