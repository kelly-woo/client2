'use strict';

angular.module('services.config', [])
    .constant('configuration', {
        name                : '@@name',
        api_address         : '@@api_address',
        api_version         : '@@api_version',
        ga_token            : '@@ga_token',
        ga_token_global     : '@@ga_token_global',
        mp_token            : '@@mp_token',
        base_url            : '@@base_url',
        base_protocol       : '@@base_protocol',
        main_address        : '@@main_address',
        app_store_address   : '@@app_store_address',
        play_store_address  : '@@play_store_address'
    }
);
