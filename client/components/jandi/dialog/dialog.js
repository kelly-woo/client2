/**
 * @fileoverview dialog config/run
 */
(function() {
  'use strict';

  angular
    .module('jandi.dialog', [
      'ui.bootstrap',
      'toastr'
    ])
    .config(config)
    .run(run);

  function config(toastrConfig) {

    // toastr customization
    _.merge(toastrConfig, {
      positionClass: 'toast-top-center',
      iconClasses: {
        error: 'icon-error',
        info: 'icon-info',
        success: 'icon-ok',
        warning: 'icon-warning'
      },
      templates: {
        toast: 'components/jandi/dialog/toast/toast.html'
      },
      timeOut: '5000'
    });
  }

  function run() {

  }
})();
