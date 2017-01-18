(function(){
    angular
        .module('login')
        .controller('LoginCtrl',[
            '$mdSidenav','$mdBottomSheet', '$timeout',
            '$mdToast', '$log','$location','Validate',
            'Auth','LoginInfo',LoginCtrl
        ])
        .controller('ToastCtrl',[
            '$mdToast', '$mdDialog', ToastCtrl
        ]);

    function LoginCtrl($mdSidenav, $mdBottomSheet, $timeout, $mdToast, $log, $location, Validate, Auth, LoginInfo){
        var self = this;
        self.loading = false;
        self.user= null;
        self.password= null;
        self.errorMessage  = null;

        self.sessionInit = sessionInit;
        self.showCustomToast = showCustomToast;

        function showCustomToast(){
            $mdToast.show({
                hideDelay   : 3000,
                position    : 'top right',
                controller  : 'ToastCtrl',
                templateUrl : './src/login/view/toast-template.html'
            });
        };

        function sessionInit(){
            self.loading = true;
            Auth.insertCredentials(self.user, self.password);
            Validate.get(function(response){
                LoginInfo.setUser(response["usuario"])
                $location.path('dashboard').replace();
            }, function(error){
                $log(error.data.Message);
                self.errorMessage = error.data.Message;
                self.showCustomToast();
            })
        }
    }

    function ToastCtrl($mdToast,$mdDialog){
        let selft = this;
        selft.closeToast = function(){
            if(isDlgOpen) return;
            $mdToast
                .hide()
                .then(function(){
                    isDlgOpen = false;
                });
        };

        selft.openMoreInfo = function(e){
            if ( isDlgOpen) return;
            isDlgOpen = true;

            $mdDialog
                .show($mdDialog
                    .alert()
                    .title('Mas info')
                    .textContent('comunicate al 3121111')
                    .ariaLabel('Mas info')
                    .targetEvent(e)
                )
                .then(function(){
                    isDlgOpen = false;
                });
        };
    };
})()