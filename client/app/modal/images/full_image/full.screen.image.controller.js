(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('FullScreenImageCtrl', FullScreenImageCtrl);

  /* @ngInject */
  function FullScreenImageCtrl($scope, modalHelper, photoUrl) {
    $scope.hasImageLoaded = false;

    $scope.cancel = modalHelper.closeModal;
    $scope.photoUrl = photoUrl;

    $scope.onImageRotatorClick = function($event) {

      var sender = angular.element($event.target);
      var senderID = sender.attr('id');

      var target = '';

      switch(senderID){
        case 'fromModal':
          target = sender.parent().siblings('img.image-background').parent();
          break;
        default :
          break;
      }

      if (target === '') return;
      var targetClass = target.attr('class');

      if (targetClass.indexOf('rotate-90') > -1) {
        target.removeClass('rotate-90');
        target.addClass('rotate-180');
      }
      else if(targetClass.indexOf('rotate-180') > -1) {
        target.removeClass('rotate-180');
        target.addClass('rotate-270');
      }
      else if(targetClass.indexOf('rotate-270') > -1) {
        target.removeClass('rotate-270');
      }
      else {
        target.addClass('rotate-90');
      }
    };

    $scope.onFullScreenImageLoad = function() {
      $scope.hasImageLoaded = true;
    }
  }

})();
