(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Loading', Loading);

  /* @ngInject */
  function Loading() {

    this.getSimpleTemplate = getSimpleTemplate;

    function getSimpleTemplate() {
      return angular.element('<div class="loading_bar">' +
                '<span class="three-quarters-loader jnd-three-quarters-loader"></span>' +
              '</div>');
    }
  }

})();

