'use strict';

var app = angular.module('jandiApp');

app.filter('fileByTitle', function() {
    return function(input, title) {
        if (title === undefined) {
            return input;
        }
        title = title.toLowerCase();

        var return_array = [];
        angular.forEach(input, function(file, index) {
            var fileTitle = file.content.title.toLowerCase();

            if (fileTitle.indexOf(title) > -1 )
                this.push(file)
        }, return_array);

        return return_array;
    }
});

app.filter('fileByWriterId', function() {
    return function(input, id) {
        if (id === undefined || id === 'everyone') {
            return input;
        }

        var return_array = [];
        angular.forEach(input, function(file, index) {
            var fileWriterId = file.writerId;

            if (fileWriterId == id ) {
                this.push(file)
            }
        }, return_array);

        return return_array;
    }
});

app.filter('fileByType', function() {
    return function (input, type) {

        if (angular.isUndefined(type) || type == 'All') {
            return input;
        }

        type = type.toLowerCase();

        var return_array = [];
        angular.forEach(input, function (file, index) {
            var fileType = file.content.type;

            if (fileType.indexOf(type) > -1) {
                this.push(file)
            }
        }, return_array);

        return return_array;
    }
});
