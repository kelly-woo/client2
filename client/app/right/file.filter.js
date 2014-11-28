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

/*
 * @filter      : file type(extension) formatting
 */
app.filter('filetype', function() {
    return function(type) {
        if (typeof type === 'undefined') return 'undefined';
        var filetype = "";
        switch(type) {
            case 'image/jpeg'       :   filetype = "JPG"; break;
            case 'image/png'        :   filetype = "PNG"; break;
            case 'image/gif'        :   filetype = "GIF"; break;
            case 'application/pdf'  :   filetype = "PDF"; break;
            case 'video/mp4'        :   filetype = "MP4"; break;
            case 'video/quicktime'  :   filetype = "MOV"; break;
            case 'audio/mp3'        :   filetype = "MP3"; break;
            case 'audio/mpeg'       :   filetype = "MPEG"; break;
            case 'application/zip'  :   filetype = "ZIP"; break;

            case 'text/plain'           :
            case 'application/msword'   :    // doc
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :    // docx
                                        filetype = "TXT"; break;

            case 'application/vnd.ms-excel' :          // xls
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :          // xlsx
                                        filetype = "EXCEL"; break;

            case 'application/vnd.ms-powerpoint' :      // ppt
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation' :  // pptx
                                        filetype = 'PPT'; break;

            default                 :   filetype = "ETC"; break;
        }
        return filetype;
    };
});