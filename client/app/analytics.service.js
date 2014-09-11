'use strict';

var app = angular.module('jandiApp');

app.factory('analyticsService', function($rootScope, $filter) {
    var analyticsAPI = {};

    analyticsAPI.mixpanelTrack = function( title, data_json ) {
        if ( _.isEmpty(title) ) return;

        data_json = data_json || {};
        mixpanel.track( title, data_json );
    };

    analyticsAPI.mixpanelIdentify = function( data_string ) {
        if ( _.isEmpty(data_string) ) return;

        mixpanel.identify( data_string );
    };

    analyticsAPI.mixpanelPeople = function( action, data_json ) {
        if ( _.isEmpty(data_json) ) return;

        switch (action) {
            case 'set':
                mixpanel.people.set( data_json );
                break;
            case 'increment':
                mixpanel.people.increment( data_json.key, data_json.value );
                break;
            default:
                break;
        }
    };

    analyticsAPI.mixpanelRegister = function( data_json ) {
        if ( _.isEmpty(data_json) ) return;

        mixpanel.register( data_json );
    };

    analyticsAPI.mixpanelAlias = function( data_string ) {
        if ( _.isEmpty(data_string) ) return;

        mixpanel.alias( data_string );
    };

    return analyticsAPI;
});
