(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('StarsAPI', StarsAPI);

  /* @ngInject */
  function StarsAPI(configuration, $http, memberService) {
  }

})();
