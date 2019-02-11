var HttpService = (function () {
  var xhr = null,
    url = '/',
    method = 'GET',
    data = null;

  var getUrlParams = function (url) {
    if (url.indexOf('?') === -1) {
      return null;
    }
    var query = url.split('?')[1];
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      var key = decodeURIComponent(pair[0]);
      var value = decodeURIComponent(pair[1]);
      if (typeof query_string[key] === "undefined") {
        query_string[key] = decodeURIComponent(value);
      } else if (typeof query_string[key] === "string") {
        var arr = [query_string[key], decodeURIComponent(value)];
        query_string[key] = arr;
      } else {
        query_string[key].push(decodeURIComponent(value));
      }
    }
    return query_string;
  };

  return {
    newInstance: function () {
      xhr = new XMLHttpRequest();
      return this;
    },
    addHeaders: function (headers) {
      if (!Array.isArray(headers)) {
        throw new Error('Argument "headers" must be an array.');
      }
      headers.forEach(function (header) {
        if (typeof header.title === 'undefined' || typeof header.value === 'undefined') {
          throw new Error('"headers" item must include both "title" and "value" props.');
        }
        xhr.setRequestHeader(header.title, header.value);
      });
      return this;
    },
    addListener: function (listener, callback) {
      xhr.addEventListener(listener, callback);
      return this;
    },
    setUrl: function (newUrl) {
      url = newUrl;
      return this;
    },
    setMethod: function (newMethod) {
      method = newMethod;
      return this;
    },
    setData: function (newData) {
      if (method === 'POST') {
        newData = JSON.parse(JSON.stringify(newData));
        for (var prop in newData) {
          if (newData.hasOwnProperty(prop)) {
            newData[prop] = encodeURIComponent(newData[prop].toString());
          }
        }
        data = newData;
      } else if (method === 'GET') {
        var currentUrlParams = getUrlParams(url);
        data = null;
        var urlParams = [];
        for (var prop in newData) {
          if (newData.hasOwnProperty(prop) && !currentUrlParams[prop]) {
            urlParams.push(encodeURIComponent(prop.toString()) + '=' + encodeURIComponent(newData[prop].toString()));
          }
        }
        var delimiter = urlParams.length === 0 ? '' : url.indexOf('?') === -1 ? '?' : '&';
        url = url + delimiter + urlParams.join('&');
      }
      return this;
    },
    send: function () {
      xhr.open(method, url);
      xhr.send(data);
      return this;
    },
    abort: function () {
      xhr.abort();
    }
  };
} ());

// Example:

// http.setMethod('GET')
//         .setUrl('/api/v2/user')
//         .setData(filters)
//         .addListener('load', onSuccess)
//         .addListener('error', onError)
//         .send();
