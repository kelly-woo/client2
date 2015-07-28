(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MentionsAPI', MentionsAPI);

  /* @ngInject */
  function MentionsAPI(configuration, $http, memberService) {
  }

})();
