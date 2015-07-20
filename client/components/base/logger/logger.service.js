/**
 * @fileoverview Logging service
 * @author JiHoon Kim <jihoonk@tosslab.com>
 *
 */
(function() {
  'use strict';

  angular
    .module('base.logger')
    .service('logger', logger);

  /* @ngInject */
  function logger(config) {
    this.log = log;
    this.socketEventLogger = socketEventLogger;
    this.desktopNotificationSettingLogger = desktopNotificationSettingLogger;

    /**
     * Print msg in console in browser.
     *
     * @param msg {string}
     */
    function log(msg) {
      if (_isTestingMode()) console.log(msg);
    }

    /**
     * Check if application is currently running on either 'development' or 'local' environment.
     *
     * @returns {boolean}
     * @private
     */
    function _isTestingMode() {
      return config.name === 'local' || config.name === 'development';
    }

    /**
     * Print basic information about socket event.
     *
     * @param event {string} name of event
     * @param data {string} data
     * @param isEmitting {boolean} true if type of socket event is 'emit'
     */
    function socketEventLogger(event, data, isEmitting) {
      if (_isTestingMode()) {
        console.log("");
        console.log("======================", isEmitting ? 'EMIT' : 'RECEIVE', "======================  ");
        console.log('event name: ', event);
        console.log('event data: ', data);
        console.log("")
      }
    }

    function desktopNotificationSettingLogger(isNotificationSupported, notificationPermission, isNotificationOnLocally,shouldSendNotification, isShowNotificationContent) {
      if (_isTestingMode()) {
        console.log("");
        console.log("============  desktop notification setting  ========================");
        console.log('is notification supported? ', _answerYesOrNoQuestion(isNotificationSupported));
        console.log("permission: ", notificationPermission);
        console.log("is browser local notification on? ", _answerYesOrNoQuestion(isNotificationOnLocally));
        console.log("so Should I send notification? ", _answerYesOrNoQuestion(shouldSendNotification));
        console.log("show content? ", _answerYesOrNoQuestion(isShowNotificationContent));
        console.log('');
      }
    }

    function _answerYesOrNoQuestion(question) {
      return question ? 'YES' : 'NO';


    }

    function consoleTime() {
      if (_.isUndefined(_startTime)) {
        _startTime = _.now();
      }
      var currentTime = _.now();
      console.log(timer + ' and ' + (currentTime - _startTime));
      _startTime = currentTime;
      timer++;
    }
  }

})();