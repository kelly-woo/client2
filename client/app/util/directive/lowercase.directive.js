'use strict';

var app = angular.module('jandiApp');

app.directive('keepLowerCase', function(publicService) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, elem, attrs, ctrl) {
            elem.bind('keyup', function() {
                this.value = publicService.toLowerCase(this.value);
            });

        }
    };
});