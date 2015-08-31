(function() {
  'use strict';

  angular
      .module('jandiApp')
      .factory('fileObjectService', fileObjectService);

  /**
   * fileObjectService는 jandiApp에서 제공하는 file object이다.
   */
  /* @ngInject */
  function fileObjectService($filter, $q, fileAPIservice, Dialog) {
    var rImage;

    rImage = /image/;

    return {
      /**
       * object 생성자
       */
      init: function($files, options) {
        // options
        this.options = {
          validateFileSize: true,
          supportAllFileAPI: !!(window.File && window.FileReader && window.FileList && window.Blob),  // page loading시 한번만 check 해야됨. 특정 네임스페이스에 값 관리 필요함.
          supportFileReader: !!window.FileReader, // page loading시 한번만 check 해야됨. 특정 네임스페이스에 값 관리 필요함.
          multiple: true,
          msgIsLarge: $filter('translate')('@file-size-too-large-error')
        };

        // options extend
        angular.extend(this.options, options);

        // files setting
        this.promise = this.setFiles($files);

        return this;
      },
      /**
       * file object setter
       */
      setFiles: function($files) {
        var deferred = $q.defer();
        var that = this;
        var options = that.options;
        var files = [];
        var alerts = [];
        var file;
        var i, len;

        for (i = 0, len = that.options.multiple ? $files.length : 1; i < len; ++i) {
          file = options.createFileObject ? options.createFileObject($files[i]) : $files[i];

          // file size check 300MB이상은 upload 하지 않음
          if (options.validateFileSize && fileAPIservice.isFileTooLarge(file)) {
            alerts.push(options.msgIsLarge + '\r\n' + (file.name || file.title));
          } else {
            // image file 여부
            file.isImage = (options.supportFileReader && rImage.test(file.type));

            files.push(file);
          }
        }

        if (alerts.length > 0) {
          Dialog.alert({
            body: alerts[0],
            onClose: (function _onClose(i) {
              return function () {
                i++;
                if (alerts[i]) {
                  Dialog.alert({
                    body: alerts[i],
                    onClose: _onClose(i)
                  });
                } else {
                  that.files = files;
                  deferred.resolve(files);
                }
              };
            }(0))
          });
        } else {
          that.files = files;
          deferred.resolve(files);
        }

        return deferred.promise;
      },
      /**
       * file object getter
       */
      getFile: function(index) {
        var that = this;
        return (angular.isNumber(index) && (index%1 === 0)) ? that.files[index] : that.files;
      },
      /**
       * file object size
       */
      size: function() {
        return this.files.length;
      },
      /**
       * file object 처리 반복자
       */
      iterator: function() {    // 상위 개념 object와 prototype 연결 필요함
        var files = this.files,
            index = 0,
            length = files.length;

        return {
          currentIndex: function() {
            return index;
          },
          next: function() {
            return index < length ? files[index++] : undefined;
          }
        };
      }
    };
  }
}());