(function() {
  'use strict';

  angular
    .module('app.config')
    .service('config', config);
    
  /* @ngInject */
  function config(configuration) {
    var self = this;
    this.init = init; 

    function init($rootScope) {
      // TODO : maybe remove next factoring
      // compatibility for current version
      $rootScope.server_address   = configuration.api_address + "inner-api/";
      $rootScope.server_uploaded  = configuration.api_address;
      $rootScope.api_version      = configuration.api_version;
      $rootScope.configuration    = configuration;  
      
      // configuration constant service       
      configuration.server_address  = configuration.api_address + "inner-api/";
      configuration.server_uploaded = configuration.api_address;
      configuration.api_version     = configuration.api_version;

      // config service
      self.server_address  = configuration.api_address + "inner-api/";
      self.server_uploaded = configuration.api_address;
      self.api_version     = configuration.api_version; 
    }

  }

})();