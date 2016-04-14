/**
 * @fileoverview intercom service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Intercom', Intercom);

  /* @ngInject */
  function Intercom($window, configuration) {
    var _that = this;
    $window.intercomSettings = {
      app_id: configuration.intercom_app_id
    };

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _injectIntercomScript();

      _that.show = show;
      _that.update = update;
    }

    /**
     * intercom 스크립트 주입
     * @private
     */
    function _injectIntercomScript() {
      var intercomScript = "(function(){var w=window;var ic=w.Intercom;if(typeof ic==='function'){ic('reattach_activator');ic('update',intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/yt1d5jat';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()";
      $('<script>' + intercomScript + '</script>')
        .appendTo($window.document.body);
      $('<script>window.Intercom("boot", window.intercomSettings); window.Intercom("update");</script>').appendTo($window.document.body);
    }

    /**
     * intercom 열림
     */
    function show() {
      $window.Intercom('show');
    }

    /**
     * intercom 정보 갱신
     * @param setting
     */
    function update(setting) {
      $window.Intercom('update', setting);
    }
  }
})();
