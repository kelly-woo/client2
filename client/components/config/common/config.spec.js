(function() {
  'use strict';

  describe('config module', function() {
    beforeEach(module('app.config'));
    
    var configuration;
    beforeEach(inject(function(_configuration_) {
      configuration = _configuration_;
    }));    

    it('configuration constant list', _configurationList);

    function _configurationList() {
      //console.log('configuration: ', configuration);
      expect(configuration).not.toBeNull();
      expect(configuration.name).not.toBeNull();
    }
  });

})();