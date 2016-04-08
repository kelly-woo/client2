/**
 * @fileoverview intercom service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Intercom', Intercom);

  /* @ngInject */
  function Intercom($window) {
    var _that = this;
    var _options = window.intercomSettings = {
      app_id: 'yt1d5jat'
      //widget: {
      //  activator: '#intercom'
      //}
    };

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _injectIntercomScript();

      _that.boot = boot;
      _that.shutdown = shutdown;
    }

    function _injectIntercomScript() {
      //(function(){var w=window;var ic=w.Intercom;if(typeof ic==='function'){ic('reattach_activator');ic('update',intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/yt1d5jat';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()

      var intercomScript = "(function(){var w=window;var ic=w.Intercom;if(typeof ic==='function'){ic('reattach_activator');ic('update',intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/yt1d5jat';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()";
      $('<script>' + intercomScript + '</script>')
        .appendTo($window.document.body);
    }

    function boot(options) {
      $window.Intercom('boot', _.extend(_options, options));
    }

    function shutdown() {
      $window.Intercom('shutdown');
    }
  }
})();
