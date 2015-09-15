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
      closeButton: true,
      positionClass: 'toast-top-center',
      iconClasses: {
        success: 'c-toast-success',
        info: 'c-toast-info',
        warning: 'c-toast-warning',
        error: 'c-toast-error'
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
