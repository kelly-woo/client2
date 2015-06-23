/**
 * @fileoverview image carousel controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('ImageCarouselCtrl', imageCarouselCtrl);

  /* @ngInject */
  function imageCarouselCtrl($scope, modalHelper, ImageCarousel, data) {

    $scope.init = init;

    function init() {
      ImageCarousel.init( data.messageId, {
        onHide: function() {
          $scope.close();
        }
      });
      $scope.title = data.title;
      ImageCarousel.load(data.imageUrl);
    }

    $scope.close = close;

    function close() {
      modalHelper.closeModal();
    }

    // title
    // imageUrl
    // hasPrev
    // hasNext



  	console.log('image carousel controller loaded ::: ');
    // $scope.photoUrl = 'http://i1.jandi.io:8888/files-private/279/39aa24da719305381c7e7e10e8eda21f.jpg';
  }
})();
