(function(){
    'use strict';
    let wsUrl = 'https://qadev.imonnetplus.com.bo';
    angular
        .module('units',['ngResource','login'])
        .factory('FuelConsumption',['$resource',FuelConsumption])
        .factory('PersistNewConsumption',['FuelConsumption','$q','Auth',PersistNewConsumption])
        .factory('Vehicle',['$resource',Vehicle])
        .factory('LoadVehicles',['Vehicle','$q','Auth', LoadVehicles])
        .factory('FuelStation',['$resource', FuelStation])
        .factory('LoadFuelStations',['FuelStation','$q','Auth', LoadFuelStations]);

    function FuelConsumption($resource){
        return $resource(wsUrl + '/int-api/v0.1/mantenimiento/combustible')
    }
    function PersistNewConsumption(FuelConsumption, $q, Auth){
        Auth;
        return function(args){
            let defer = $q.defer();
            FuelConsumption.save(args, function(saved){
                defer.resolve(save);
            }, function(error){
                defer.reject(error);
            });
            return defer.promise;
        }
        
    }

    function Vehicle($resource){
        return $resource(wsUrl + '/int-api/v0.1/administracion/vehiculo')
    }
    function FuelStation($resource){
        return $resource(wsUrl + '/int-api/v0.1/mantenimiento/fuelstation')
    }

    function LoadVehicles(Vehicle, $q, Auth){
        Auth;
        return function(){
            let defer = $q.defer();
            Vehicle.get({},function(vehicles){
                defer.resolve(vehicles);
            }, function(error){
                defer.reject(error);
            });
            return defer.promise;
        };
    }
    function LoadFuelStations(FuelStation, $q, Auth){
        Auth;
        return function(){
            let defer = $q.defer();
            FuelStation.get({}, function(fuelStations){
                defer.resolve(fuelStations);
            }, function(error){
                defer.reject(error);
            });
            return defer.promise;
        };
    }
})()
