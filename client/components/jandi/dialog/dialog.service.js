/**
 * @fileoverview dialog service
 */
(function() {
  'use strict';

  angular
    .module('jandi.dialog')
    .service('Dialog', Dialog);

  /* @ngInject */
  function Dialog($rootScope, $modal, $q, Toast) {
    var that = this;
    var modals = ['alert', 'confirm'];
    var toasts = ['success', 'info', 'warning', 'error'];

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
       */
      /**
       * confirm modal
       * @function confirm
       * @param {object} options
       * @param {string} options.title              - modal title
       * @param {string} options.body               - modal body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       */
      _.each(modals, function(name) {
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
       */
      /**
       * info toast
       * @function info
       * @param {object} options
       * @param {string} options.title              - toast title
       * @param {string} options.body               - toast body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @param {number} [options.timeOut=5000]     - toast 유지시간
       */
      /**
       * warning toast
       * @function warning
       * @param {object} options
       * @param {string} options.title              - toast title
       * @param {string} options.body               - toast body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @param {number} [options.timeOut=5000]     - toast 유지시간
       */
      /**
       * error toast
       * @function error
       * @param {object} options
       * @param {string} options.title              - toast title
       * @param {string} options.body               - toast body
       * @param {boolean} [options.allowHtml=false] - title,body property 값으로 html tag 가능 여부
       * @param {function} [options.onClose]        - close callback
       * @param {number} [options.timeOut=5000]     - toast 유지시간
       */
      _.each(toasts, function(name) {
        that[name] = (function(name) {
          return function(options) {
            var deferred = $q.defer();

            if (_.isFunction(Toast[name]) && _.isObject(options)) {
              options.type = name;
              Toast.show(name, options, deferred);
            }

            return deferred.promise;
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
