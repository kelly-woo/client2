(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Loading', Loading);

  /* @ngInject */
  function Loading() {

    this.getTemplate = getTemplate;
    this.getElement = getElement;

    /**
     * loading template을 전달함.
     * @returns {string}
     */
    function getTemplate() {
      return '<div class="loading_bar">' +
        '<span class="three-quarters-loader jnd-three-quarters-loader"></span>' +
        '</div>';
    }

    /**
     * loading element를 전달함.
     * @returns {*}
     */
    function getElement() {
      return angular.element(getTemplate());
    }
  }

})();

