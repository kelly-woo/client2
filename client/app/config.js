'use strict';

angular.module('services.config', [])
    .constant('configuration', {
        name        : 'development',
//        api_address : 'https://dev.jandi.com:2323/',
        api_address : 'https://local.jandi.com/',
        api_version : '1',
        ga_token    : 'UA-52594224-1',
        mp_token    : '081e1e9730e547f43bdbf59be36a4e31'
    }
);
