'use strict';

var app = angular.module('jandiApp');

app.controller('tutorialController', function($rootScope, $modalInstance, $scope, $state) {

    console.info('[enter] tutorialController');

    var welcomeMsg  = 0;
    var chatMsg     = 1;
    var fileMsg     = 2;
    var tutorialOff = 3;

    var messageContainerWidth = 420;
    var fileMsgContainerOffset = 20;

    $scope.toNextstate= function() {
        var nextState = -1;
        
        if (angular.isUndefined($scope.curState)) {
            $scope.curState = welcomeMsg;
            return;
        }
        switch($scope.curState) {
            case welcomeMsg:
                nextState = chatMsg;
                setChatMsg();
                break;
            case chatMsg:
                nextState = fileMsg;
                setFileMsg();
                break;
            case fileMsg:
                nextState = tutorialOff;
                $modalInstance.dismiss('tutorialDone');
                break;
            default:
                nextState = welcomeMsg;
                break;
        }
        $scope.curState = nextState;
    };

    $scope.toNextstate();

    function setChatMsg() {

//        var prevElement = angular.element(document.getElementById('welcome_message_container'));
//        prevElement.addClass('opac_out');

        var element = angular.element(document.getElementsByClassName('welcome-tutorial'));
        element.addClass('chat-message-tutorial');

        // adding backgroud-color to backdrop
        var backdrop = angular.element(document.getElementsByClassName('modal-backdrop'));
        backdrop.addClass('tutorial-backdrop');

    }

    function setFileMsg() {
        $state.go('messages.detail.files');
        $scope.$emit('updateFileTypeQuery', 'all');

        var element = angular.element(document.getElementsByClassName('welcome-tutorial'));
        element.addClass('file-message-tutorial');

        var backdrop = angular.element(document.getElementsByClassName('modal-backdrop'));
        backdrop.addClass('tutorial-file-backdrop');

    }

    $scope.skipTutorial = function() {
        $modalInstance.dismiss('skip');
    };

    $scope.toprev =function() {
        if ($scope.curState == 0) {
            return;
        }
        else if ($scope.curState == 1) {
            var element = angular.element(document.getElementsByClassName('welcome-tutorial'));
            element.removeClass('chat-message-tutorial');
            var backdrop = angular.element(document.getElementsByClassName('modal-backdrop'));

            backdrop.removeClass('tutorial-backdrop');
        }
        else if ($scope.curState == 2) {
            var element = angular.element(document.getElementsByClassName('welcome-tutorial'));
            element.removeClass('file-message-tutorial');

            var backdrop = angular.element(document.getElementsByClassName('modal-backdrop'));
            backdrop.removeClass('tutorial-file-backdrop');
        }
        $scope.curState -= 1;

    }
});
