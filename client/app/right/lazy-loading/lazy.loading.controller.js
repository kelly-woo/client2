/**
 * @fileoverview file detail controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('LazyLoadingCtrl', LazyLoadingCtrl);

  /* @ngInject */
  function LazyLoadingCtrl($scope) {
    var _that = this;

    _that.msg = 'foo bar';
  }
})();
