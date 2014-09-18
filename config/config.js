'use strict';

angular.module('services.config', [])
    .constant('configuration', {
        name        : '@@name',
        api_address : '@@api_address',
        api_version : '@@api_version',
        ga_token    : '@@ga_token',
        mp_token    : '@@mp_token'
    }
);
