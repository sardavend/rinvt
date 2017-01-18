(function(){
    'use strict'
    let wsUrl = 'https://qadev.imonnetplus.com.bo';
    angular.module('login')
            //.services('loginService', ["$cookies"])
            .factory('Auth',["$cookies", "$http", Auth])
            .factory('Validate',["$resource", Validate])
            .service('LoginInfo',["$cookies", LoginInfo])
            .factory('LoadInfoClient',['Validate','LoginInfo','Auth','$q', LoadInfoClient])


    function LoginInfo($cookies){
        return {
            getUser: function(){
                return $cookies.get('demin');
            },
            setUser: function(value){
                return $cookies.put('demin',value);
            }
        }
   };

    function Validate($resource){
        return $resource(wsUrl + '/int-api/v0.1/validacion')
    }
    function Auth($cookies, $http){
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('authdata');
        $http.defaults.headers.delete = {"Content-Type":"application/json;charset=utf-8"};
        return{
            insertCredentials: function(login, password){
                let encoded = btoa(login + ':' + password);
                $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                $cookies.put('authdata', encoded);
            },
            deleteCredentials: function () {
                document.execCommand("ClearAuthenticationCache");
                $cookies.remove('authdata');
                $cookies.remove('demin');
                $http.defaults.headers.common.Authorization = 'Basic ';
            }
        };
    };

    function LoginService($cookies, $http){
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookies.get('authdata');

    };

    function LoadInfoClient(Validate, LoginInfo, Auth, $q){
        Auth;
        return function(){
            var defer = $q.defer();
            Validate.get(function(valInfo){
                LoginInfo.setUser(valInfo['usuario']);
                defer.resolve(valInfo);
            }, function(error){
                defer.reject(error.data.Message);
            });
            return defer.promise;
        };
    };
})();
