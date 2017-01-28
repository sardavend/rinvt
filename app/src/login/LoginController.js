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

        function showCustomToast(message){
            $mdToast.show({
                hideDelay   : 4000,
                position    : 'bottom center',
                controller  : ToastCtrl,
                controllerAs: "tc",
                templateUrl : 'src/login/view/toas-template.html',
                locals:{
                    message: message
                }
            }).then(function(){
                self.loading = false;
            });
        };

        function sessionInit(){
            self.loading = true;
            Auth.insertCredentials(self.user, self.password);
            Validate.get(function(response){
                LoginInfo.setUser(response["usuario"])
                $location.path('dashboard').replace();
            }, function(error){
                $log.error(error.data.message);
                self.errorMessage = error.data.message;
                self.showCustomToast(self.errorMessage);
            })
        }
    }

    function ToastCtrl($mdToast,$mdDialog, message){
        let selft = this;
        selft.errorMessage = message;
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