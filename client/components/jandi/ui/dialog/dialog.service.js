/**
 * @fileoverview dialog service
 * @see https://github.com/Foxandxss/angular-toastr
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.dialog')
    .service('Dialog', Dialog);

  /* @ngInject */
  function Dialog($rootScope, $modal, $q, Toast) {
    var that = this;
    var _modals = ['alert', 'confirm'];
    var _toasts = ['success', 'info', 'warning', 'error'];

    _init();

    function _init() {
      /**
       * alert modal
       * @function alert
       * @param {object} options
       * @param {string} [options.title]            - modal title
       * @param {string} options.body               - modal body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @returns {*}
       */
      /**
       * confirm modal
       * @function confirm
       * @param {object} options
       * @param {string} options.title              - modal title
       * @param {string} options.body               - modal body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @returns {*}
       */
      _.each(_modals, function(name) {
        that[name] = (function(name) {
          return function(options) {
            var deferred  = $q.defer();

            if (_.isObject(options)) {
              options.type = name;
              options.deferred = deferred;
              $modal.open(_getModalOptions(options));
            }

            return deferred.promise;
          };
        }(name));
      });

      /**
       * success toast
       * @function success
       * @param {object} options
       * @param {string} options.title              - toast title
       * @param {string} options.body               - toast body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @param {number} [options.timeOut=5000]     - toast 유지시간
       * @returns {*}
       */
      /**
       * info toast
       * @function info
       * @param {object} options
       * @param {string} options.title              - toast title
       * @param {string} options.body               - toast body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @param {number} [options.timeOut=5000]     - toast 유지시간(ms)
       * @returns {*}
       */
      /**
       * warning toast
       * @function warning
       * @param {object} options
       * @param {string} options.title              - toast title
       * @param {string} options.body               - toast body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @param {number} [options.timeOut=5000]     - toast 유지시간(ms)
       * @returns {*}
       */
      /**
       * error toast
       * @function error
       * @param {object} options
       * @param {string} options.title              - toast title
       * @param {string} options.body               - toast body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @param {number} [options.timeOut=5000]     - toast 유지시간(ms)
       * @returns {*}
       */
      _.each(_toasts, function(name) {
        that[name] = (function(name) {
          return function(options) {
            var deferred = $q.defer();

            if (_.isFunction(Toast[name]) && _.isObject(options)) {
              options.type = name;
              Toast.show(name, options, deferred);
            }

            return deferred.promise;
          };
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
        templateUrl: 'components/jandi/ui/dialog/modal/modal.html',
        windowClass: options.windowClass || 'center-dialog-modal',
        backdrop: options.backdrop || 'static',
        resolve: {
          options: function() {
            return options;
          }
        }
      };
    }
  }
})();
