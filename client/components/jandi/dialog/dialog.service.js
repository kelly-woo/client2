/**
 * @fileoverview dialog service
 */
(function() {
  'use strict';

  angular
    .module('jandi.dialog')
    .service('Dialog', Dialog);

  /* @ngInject */
  function Dialog($rootScope, $modal, Toast) {
    var that = this;

    _init();

    function _init() {
      that.alert = alert;
      that.confirm = confirm;
      that.toast = toast;
    }

    /**
     * alert dialog
     * @param {object} options
     * @param {string} [title]            - modal title
     * @param {string} body               - modal body
     * @param {boolean} [allowHtml=false] - title,body property 값으로 html tag 가능 여부
     * @param {function} [onClose]        - close callback
     */
    function alert(options) {
      if (_.isObject(options)) {
        options.type = 'alert';
        $modal.open(_getModalOptions(options));
      }
    }

    /**
     * confirm dialog
     * @param {object} options
     * @param {string} title              - modal title
     * @param {string} body               - modal body
     * @param {boolean} [allowHtml=false] - title,body property 값으로 html tag 가능 여부
     * @param {function} [onClose]        - close callback
     */
    function confirm(options) {
      if (_.isObject(options)) {
        options.type = 'confirm';
        $modal.open(_getModalOptions(options));
      }
    }

    /**
     * modal options 전달
     * @param options
     * @returns {{scope: (*|Object), controller: string, templateUrl: string, windowClass: string, resolve: {options: Function}}}
     * @private
     */
    function _getModalOptions(options) {
      return {
        scope: $rootScope.$new(true),
        controller: 'ModalCtrl',
        templateUrl: 'components/jandi/dialog/modal/modal.html',
        windowClass: 'center-dialog-modal',
        resolve: {
          options: function() {
            return options;
          }
        }
      };
    }

    /**
     *
     * @param {string} type               - info, warning, error
     * @param {object} options
     * @param {string} title              - toast title
     * @param {string} body               - toast body
     * @param {boolean} [allowHtml=false] - title,body property 값으로 html tag 가능 여부
     * @param {function} [onClose]        - close callback
     * @param {number} [timeOut=5000]     - toast 유지시간
     */
    function toast(type, options) {
      if (_.isFunction(Toast[type]) && _.isObject(options)) {
        Toast.show(type, options);
      }
    }
  }
})();
