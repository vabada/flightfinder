'use strict';

angular.module('flightFinderApp')

	.controller('SearchCtrl', ['$scope','$http','APIService','$q', function ( $scope, $http, APIService, $q) {

		$scope.arrays = {};

		var paths = ["airports","routes","countries"/*,"cheap-flights/LGW/DUB/2015-02-02/2015-04-02/500*/];

		angular.forEach(paths, function(value, key) {
			getData(value);
		});
		
		$scope.selected = undefined;

		function parseData(path,data) {
			$scope.arrays[path] = data;
			if (path == "airports"){
				paintAllAirports();
			}
		}

		function getData (path){
			var promise = APIService.getAPI(path);
			promise.then(function (data) {
				parseData(path, data);				
			},function (error) {
				//console.log(error)
				handleError();
			});

			function handleError (){
				var promise = APIService.getLocal(path);
				promise.then(function (data) {
					parseData(path, data);
				},function (error) {
					alert(error);
				});
			}
		}

		function airportIsOK (nameToCheck){
			var bool = false;
			angular.forEach($scope.arrays["airports"].airports, function(value, key) {
				if (nameToCheck == value.name){
					bool = true;
				}
			});
			return bool;
		}

		function getIataCode (city){
			var iataCode;
			angular.forEach($scope.arrays["airports"].airports, function(value, key) {
				if (city == value.name){
					iataCode = value.iataCode;
				}
			});
			return iataCode;
		}

		function getAirportFromIata (iata){
			var name;
			angular.forEach($scope.arrays["airports"].airports, function(value, key) {
				if (iata == value.iataCode){
					name = value.name;
				}
			});
			return name;
		}

		function getCoordFromName (name){
			var latlng;
			angular.forEach($scope.arrays["airports"].airports, function(value, key) {
				if (name == value.name){
					latlng = new google.maps.LatLng(value.latitude, value.longitude);
				}
			});
			return latlng;
		}

		function getAllRoutes (from){
			var destinations = [];
			angular.forEach($scope.arrays["routes"].airports, function(value, key) {
				if (from == key){
					destinations = value;
				}
			});
			return destinations;
		}

		var lines = [];
		var markers = [];

		function paintRoutes (from){
			var routes = getAllRoutes(getIataCode(from));
			var origin = getCoordFromName(from);
			var airports = [];
			angular.forEach(routes, function(value, key) {
				airports.push(getAirportFromIata(value));
			});
			angular.forEach(markers, function(v,k){	
				angular.forEach(airports, function(value, key) {
					if (v.title == value){

						var destination = v.position
						var line = new google.maps.Polyline({
						      path: [origin, origin],
						      strokeColor: "#0000FF",
						      strokeOpacity: 1,
						      strokeWeight: 3,
						      geodesic: true	
						 });
						 var step = 0;
						 var numSteps = 150; //Change this to set animation resolution
						 var timePerStep = 5; //Change this to alter animation speed
						 var interval = setInterval(function() {
						     step += 1;
						     if (step > numSteps) {
						         clearInterval(interval);
						     } else {
						         var are_we_there_yet = google.maps.geometry.spherical.interpolate(origin,destination,step/numSteps);
						         line.setPath([origin, are_we_there_yet]);
						     }
						 }, timePerStep);

						line.setMap($scope.map);
						lines.push(line);

						v.setIcon('img/harp_logo_2.png');
						v.setVisible(true);
					}
				});
			});
		}

		$scope.selectAirport = function(airport){

			var airportSelected = airport || $scope.selected;

			if( airportIsOK(airportSelected)) {
				angular.forEach(markers, function(value, key) {
					value.setVisible(value.title == airportSelected);
					value.setIcon('img/harp_logo_3.png');
				});
				paintRoutes(airportSelected);
			} else {
				angular.forEach(markers, function(value, key) {
					value.setIcon('img/harp_logo_2.png');
					value.setVisible(true);
				});
				angular.forEach(lines, function(value, key) {
					value.setMap(null);
				});
			}
		};

		function paintAllAirports (){
						
			var airports = $scope.arrays["airports"].airports;
	
			angular.forEach(airports, function(value, key) {

				var image = 'img/harp_logo_2.png'
			    var latlng = new google.maps.LatLng(value.latitude, value.longitude);

				markers[key] = new google.maps.Marker({
					title: value.name,
					iataCode: value.iataCode,
					position: latlng,
					icon: image
				})

				name = markers[key].title;

				//Event when clicking a marker
				google.maps.event.addListener(markers[key], 'click', function(markers) {
			        angular.forEach(lines, function(value, key) {
						value.setMap(null);
					});
					$scope.selected = this.title;	
			        $scope.selectAirport(this.title);
			        paintRoutes(this.title);
			    });

				markers[key].setMap($scope.map)
			});
		}
	}]);