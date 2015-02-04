'use strict';

var app = angular.module('jandiApp');

app.controller('tutorialController', function($rootScope, curState, $modalInstance, $scope, $state) {

  var topicTutorial   = 1;
  var chatTutorial    = 2;
  var fileTutorial    = 3;

  $scope.curState = curState;

  initTutorial();

  function initTutorial() {
    if ($scope.curState === 0) return;

    switch($scope.curState) {
      case 1:
        setTopicTutorial();
        break;
      case 2:
        setChatTutorial();
        break;
      case 3:
        setFileTutorial();
        break;
      default:
        break;
    }

    $('.tutorial_opac_background').addClass('opac_in_to_30');

  }


  function setTopicTutorial() {
    applyHeaderOpacLayer();
    applyCenterOpacLayer();
    applyLeftUser();
    applyRightOpacLayer();

    if ($state.current.name == 'messages.detail.files')
      $state.go('messages.detail');

  }
  function setChatTutorial() {
    applyHeaderOpacLayer();
    applyCenterOpacLayer();
    applyLeftOpacLayer();
    applyRightOpacLayer();

    angular.element(document.getElementsByClassName('footer')).addClass('tutorial-z-index');

    if ($state.current.name == 'messages.detail.files')
      $state.go('messages.detail');

  }
  function setFileTutorial() {
    applyLeftOpacLayer();
    applyCenterOpacLayer();
    applyHeaderOpacLayer();

    // what is wrong with this line???
    angular.element(document.getElementsByClassName('hpanel')).children('.header').children('.tutorial_opac_background').addClass('file-tutorial-header-opac');
    angular.element(document.getElementsByClassName('rpanel')).addClass('tutorial-z-index');

    $state.go('messages.detail.files');
    $scope.$emit('updateFileTypeQuery', 'all');
  }

  function applyLeftOpacLayer() {
    applyLeftUser();
    applyLeftList();
  }
  function applyLeftUser() {
    var background_overlay = angular.element('<div class="tutorial_opac_background lpanel_user"></div>');
    angular.element(document.getElementsByClassName('lpanel')).append(background_overlay);
  }
  function applyLeftList() {
    var background_overlay = angular.element('<div class="tutorial_opac_background lpanel_list"></div>');
    angular.element(document.getElementsByClassName('lpanel')).append(background_overlay);
  }

  function applyCenterOpacLayer() {
    var background_overlay = angular.element('<div class="tutorial_opac_background cpanel_background"></div>');
    angular.element(document.body).append(background_overlay);
  }
  function applyRightOpacLayer() {
    var background_overlay = angular.element('<div class="tutorial_opac_background"></div>');
    angular.element(document.getElementsByClassName('rpanel')).append(background_overlay);
  }
  function applyHeaderOpacLayer() {
    var background_overlay = angular.element('<div class="tutorial_opac_background"></div>');
    angular.element(document.getElementsByClassName('header')).append(background_overlay);
  }

  function removeTopicTutorial() {
  }
  function removeChatTutorial() {
    angular.element(document.getElementsByClassName('footer')).removeClass('tutorial-z-index');

  }
  function removeFileTutorial() {
    angular.element(document.getElementsByClassName('rpanel')).removeClass('tutorial-z-index');
    angular.element(document.getElementsByClassName('header')).removeClass('file-tutorial-header-opac');
  }

  function removeOpacLayer() {
    $('div').remove('.tutorial_opac_background');
  }

  $scope.skipTutorial = function(reason) {
    removeOpacLayer();

    switch($scope.curState) {
      case topicTutorial:
        removeTopicTutorial();
        break;
      case chatTutorial:
        removeChatTutorial();
        break;
      case fileTutorial:
        removeFileTutorial();
        break;
      default:
        break;

    }
    $modalInstance.close(reason);
  };


});
