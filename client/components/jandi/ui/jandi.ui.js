/**
 * @fileoverview jandi app에 종속적인 ui component 모음
 *
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui', [
      'jandi.ui.dialog',
      'jandi.ui.profileImage'
    ])
    .run(run)
    .config(config);

  /* @ngInject */
  function config() {
  }

  /* @ngInject */
  function run() {
  }

})();
