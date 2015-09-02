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
    var modals = ['alert', 'confirm'];
    var toasts = ['success', 'info', 'warning', 'error'];

    _init();

    function _init() {
      /**
       * alert modal
       * @param {object} options
       * @param {string} [title]            - modal title
       * @param {string} body               - modal body
       * @param {boolean} [allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [onClose]        - close callback
       */
      /**
       * confirm modal
       * @param {object} options
       * @param {string} title              - modal title
       * @param {string} body               - modal body
       * @param {boolean} [allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [onClose]        - close callback
       */
      _.each(modals, function(name) {
        that[name] = (function(name) {
          return function(options) {
            if (_.isObject(options)) {
              options.type = name;
              $modal.open(_getModalOptions(options));
            }
          };
        }(name));
      });

      /**
       * success toast
       * @param {object} options
       * @param {string} title              - toast title
       * @param {string} body               - toast body
       * @param {boolean} [allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [onClose]        - close callback
       * @param {number} [timeOut=5000]     - toast 유지시간
       */
      /**
       * info toast
       * @param {object} options
       * @param {string} title              - toast title
       * @param {string} body               - toast body
       * @param {boolean} [allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [onClose]        - close callback
       * @param {number} [timeOut=5000]     - toast 유지시간
       */
      /**
       * warning toast
       * @param {object} options
       * @param {string} title              - toast title
       * @param {string} body               - toast body
       * @param {boolean} [allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [onClose]        - close callback
       * @param {number} [timeOut=5000]     - toast 유지시간
       */
      /**
       * error toast
       * @param {object} options
       * @param {string} title              - toast title
       * @param {string} body               - toast body
       * @param {boolean} [allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [onClose]        - close callback
       * @param {number} [timeOut=5000]     - toast 유지시간
       */
      _.each(toasts, function(name) {
        that[name] = (function(name) {
          return function(options) {
            if (_.isFunction(Toast[name]) && _.isObject(options)) {
              options.type = name;
              Toast.show(name, options);
            }
          }
        }(name));
      });
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
  }
})();
