(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('imageCarouselCtrl', imageCarouselCtrl);

  /* @ngInject */
  function imageCarouselCtrl($scope) {
    $scope.photoUrl = 'http://i1.jandi.io:8888/files-private/279/39aa24da719305381c7e7e10e8eda21f.jpg';
  }
})();
