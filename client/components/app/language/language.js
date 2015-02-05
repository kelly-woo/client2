(function(){
    'use strict';

    angular
        .module('app.language', ['gettext'])
        .run(run)
        .config(config);

    /* @ngInject */
    function config() {}

    /* @ngInject */
    function run($rootScope, language) {
        $rootScope.preferences = language.preferences;
        $rootScope.listLangs = language.listLangs;
        $rootScope.setLang = language.setLang;
        language.init();
    }

})();