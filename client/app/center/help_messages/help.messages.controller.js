(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('HelpMessageCtrl', HelpMessageCtrl);

  /* @ngInject */
  function HelpMessageCtrl($scope, $rootScope, $filter, $timeout, modalHelper) {
    // TODO: TO CONFIG??
    var NO_MEMBER_IN_TEAM = 'NO_MEMBER_IN_TEAM';
    var NO_MEMBER_IN_TOPIC = 'NO_MEMBER_IN_TOPIC';
    var NO_FILES_UPLOADED = 'NO_FILES_UPLOADED';
    var NO_CONVERSATION_IN_TOPIC = 'NO_CONVERSATION_IN_TOPIC';
    var EVERYONE_IN_THE_BUILDING = 'EVERYONE_IN_THE_BUILDING';

    var primaryFileButton = $('#primary_file_button');

    var currentState;
    (function() {
      _init();
    })();

    /**
     *  If status is changed in center panel,
     *    1. NO_MEMBER_IN_TOPIC -> NO_CONVERSATION_IN_TOPIC or
     *    2. NO_CONVERSATION_IN_TOPIC -> NO_MEMBER_IN_TOPIC
     *
     *  Directive needs to change its image and messages.
     *
     */
    $scope.$on('onEntityMessageStatusChanged', function(event, param) {
      if (_isCenterRelated()) {
        $scope.currentState = param;
        _getCurrentHelpState();
      }
    });

    /**
     * Checks if current state is related to center panel.
     * @returns {boolean}
     * @private
     */
    function _isCenterRelated() {
      return  currentState == NO_CONVERSATION_IN_TOPIC ||
              currentState == NO_MEMBER_IN_TOPIC ||
              currentState == EVERYONE_IN_THE_BUILDING ||
              currentState == NO_MEMBER_IN_TEAM;
    }

    function _init() {
      _getCurrentHelpState();
    }

    function _getCurrentHelpState() {
      currentState = $scope.currentState;

      switch (currentState) {
        case NO_MEMBER_IN_TEAM:
          _createTemplate(
            'help-invite-members',
            $filter('translate')('@emptyMsg-no-team-member-joined'),
            $filter('translate')('@emptyMsg-click-to-invite-to-current-team'),
            true,
            $filter('translate')('@btn-invite'),
            _openInviteToTeamModal
          );
          break;
        case NO_MEMBER_IN_TOPIC:
          _createTemplate(
            'help-invite-members',
            $filter('translate')('@emptyMsg-you-are-all-alone-heading'),
            $filter('translate')('@emptyMsg-click-to-invite-to-current-topic'),
            true,
            $filter('translate')('@btn-invite'),
            _openInviteModal
          );
          break;
        case NO_FILES_UPLOADED:
          _createTemplate(
            'help-upload-a-file',
            $filter('translate')('@emptyMsg-your-file-drawer-is-empty-heading'),
            $filter('translate')('@emptyMsg-click-to-share-file'),
            false,
            $filter('translate')('@common-upload-file')
          );
          break;
        case NO_CONVERSATION_IN_TOPIC:
          _createTemplate(
            'help-enter-a-message',
            $filter('translate')('@emptyMsg-start-chatting-heading'),
            '',
            false,
            '',
            _setChatInputBoxFocus
          );
          break;
        case EVERYONE_IN_THE_BUILDING:
          _createTemplate(
            'help-invite-members',
            $filter('translate')('@emptyMsg-everyone-in-current-topic'),
            $filter('translate')('@emptyMsg-invite-not-joined-teammate'),
            true,
            $filter('translate')('@btn-invite'),
            _openInviteToTeamModal
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

      $scope.onButtonClicked = _.isFunction(actionFunction) ? actionFunction : function() {};
    }

    function _openInviteToTeamModal() {
      modalHelper.closeModal();
      modalHelper.openInviteToTeamModal();
    }
    function _openInviteModal() {
      modalHelper.openTopicInviteModal();
    }

    function _setChatInputBoxFocus() {
      $rootScope.$broadcast('setChatInputFocus');
    }
  }
})();