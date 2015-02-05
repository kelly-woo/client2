(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('tutorialService', tutorialService);

  tutorialService.$inject = ['$modal', '$http', 'configuration'];

  function tutorialService($modal, $http, configuration) {

    var api_address = configuration.api_address + 'inner-api/';

    this.openWelcomeModal = openWelcomeModal;
    this.openTopicModal = openTopicModal;
    this.openChatModal = openChatModal;
    this.openFileModal = openFileModal;
    this.openChangeLogModal = openChangeLogModal;

    this.setTutoredAtTime = setTutoredAtTime;

    function openWelcomeModal() {
      return $modal.open({
        templateUrl: 'app/tutorial/tutorial.html',
        controller: 'tutorialController',
        windowClass: 'fade-only welcome-tutorial',
        backdropClass: 'welcome-tutorial-backdrop',
        backdrop: 'static',
        keyboard: false,
        resolve: {
          curState: function getCurrentTutorial() {
            return 0;
          }
        }
      });
    }
    function openTopicModal() {
      return $modal.open({
        templateUrl: 'app/tutorial/tutorial.html',
        controller: 'tutorialController',
        windowClass: 'fade-only welcome-tutorial topic-tutorial tutorial-animation',
        backdrop: false,
        keyboard: false,
        resolve: {
          curState: function getCurrentTutorial() {
            return 1;
          }
        }
      });
    }
    function openChatModal() {
      return $modal.open({
        templateUrl: 'app/tutorial/tutorial.html',
        controller: 'tutorialController',
        windowClass: 'fade-only welcome-tutorial chat-tutorial',
        backdrop: false,
        keyboard: false,
        resolve: {
          curState: function getCurrentTutorial() {
            return 2;
          }
        }
      });
    }
    function openFileModal() {
      return $modal.open({
        templateUrl: 'app/tutorial/tutorial.html',
        controller: 'tutorialController',
        windowClass: 'fade-only welcome-tutorial file-tutorial',
        backdrop: false,
        keyboard: false,
        resolve: {
          curState: function getCurrentTutorial() {
            return 3;
          }
        }
      });
    }
    function openChangeLogModal() {
      return $modal.open({
        templateUrl: 'app/modal/change_log/changeLog.html',
        controller: 'tutorialController',
        windowClass: 'fade-only welcome-tutorial topic-tutorial tutorial-animation',
        backdrop: false,
        keyboard: false,
        resolve: {
          curState: function getCurrentTutorial() {
            return 1;
          }
        }
      });
    }

    function setTutoredAtTime() {
      return $http({
        method: 'PUT',
        url: api_address + 'settings/tutoredAt'
      });
    }
  }
})();