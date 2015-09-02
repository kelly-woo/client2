/**
 * @fileoverview toast service
 * toast service는 'angular-toastr' component를 사용함.
 * 해당 component에 대한 설명은 'https://github.com/Foxandxss/angular-toastr' 참고
 */
(function() {
  'use strict';

  // FILE UPLOAD controller
  angular
    .module('jandi.dialog')
    .service('Toast', Toast);

  /* @ngInject */
  function Toast(toastr) {
    var that = this;
    var singleToast = false;
    var toastInstance;

    _init();

    function _init() {
      that.show = show;

      that.success = success;
      that.info = info;
      that.warning = warning;
      that.error = error;
    }

    /**
     * toast type 별로 show
     * @param {string} type - info, warning, error
     * @param {object} options
     */
    function show(type, options) {
      var title = options.title;
      var body = options.body;

      if (singleToast && toastInstance) {
        toastr.clear(toastInstance);
      }

      toastInstance = that[type](title, body, _.extend(options, {
        onHidden: _getOnClose(options)
      }));
    }

    /**
     * success toast open
     * @param {string} title
     * @param {string} body
     * @param {object} options
     * @returns {*}
     */
    function success(title, body, options) {
      return toastr.success(title, body, options);
    }

    /**
     * info toast open
     * @param {string} title
     * @param {string} body
     * @param {object} options
     * @returns {*}
     */
    function info(title, body, options) {
      return toastr.info(title, body, options);
    }

    /**
     * warning toast open
     * @param {string} title
     * @param {string} body
     * @param {object} options
     * @returns {*}
     */
    function warning(title, body, options) {
      return toastr.warning(title, body, options);
    }

    /**
     * error toast open
     * @param {string} title
     * @param {string} body
     * @param {object} options
     * @returns {*}
     */
    function error(title, body, options) {
      return toastr.error(title, body, options);
    }

    /**
     * close callback 전달
     * @param {object} options
     * @returns {Function}
     * @private
     */
    function _getOnClose(options) {
      return function() {
        var fn = options.onClose;

        fn && fn();
      };
    }
  }
}());
