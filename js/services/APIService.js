//'use strict';

angular.module('flightFinderApp')

    .service('APIService', ['$http','$q', function($http, $q) {
            
        var url = 'https://ryanair-test.herokuapp.com/api/';
        //var url = "http://public-api.wordpress.com/rest/v1/sites/wtmpeachtest.wordpress.com/posts?callback=JSON_CALLBACK"; //used for trials. Here it works
        var localUrl = "json/"

	    var myFunctions = {

		    getLocal: function(path) {
				var deferred = $q.defer();
				$http.get(localUrl + path)
					.success(function (data) { 
						deferred.resolve({
							airports: data});
					}).error(function (msg, code) {
						deferred.reject(msg);
					});
				return deferred.promise;
				
			},

		    getAPI: function(path) {
        		var headers = {'Content-Type': "application/json"}
        		var deferred = $q.defer();
        		$http.jsonp(url + path + "?callback=JSON_CALLBACK", headers )
        			.success(function (data) {
		                deferred.resolve({
							airports: data});
		            }).error(function (data, status, headers, config) {
		                console.log( data, status, headers, config);
		                deferred.reject(data);
		            });
		        return deferred.promise;
	    	}
		}

		return myFunctions;
    }]);