(function(){
    angular
        .module('gasLoader')
        .controller('GasLoaderCtrl',[
            '$mdSidenav','$mdBottomSheet', '$timeout', '$log','units','fuelStations',"$document",'LoginInfo','$rootScope','PersistNewConsumption','FuelConsumption','$filter','$mdDialog',
            GasLoaderCtrl
        ]);

    function GasLoaderCtrl($mdSidenav, $mdBottomSheet, $timeout, $log, units, fuelStations, $document,LoginInfo, $rootScope,PersistNewConsumption,FuelConsumption, $filter,$mdDialog){
        var self = this;
        self.loading = false;
        self.customFullscreen = false;
        $rootScope.userName = LoginInfo.getUser();
        if ($rootScope.userName !== undefined){
            $rootScope.showUser = true;
        }
        $document.find('input').on('keydown', function(ev) {
          ev.stopPropagation();
        })
        self.inputSearch;
        self.driverName = null;
        self.dateTime = null;
        self.odometer = null;
        self.liters = null;
        self.price = null;
        self.units= units.Data;
        self.fuelStations = fuelStations.Data;
        self.selectedFuelStation = null;
        self.selectedUnit= null;
        self.gasStations = [];
        self.save = save;  
        self.showAlert = showAlert;
        resetForm();
        function resetForm(){
            self.inputSearch = undefined;
            self.inputSearchStation = undefined;
            self.dateTime = null;
            self.odometer = null;
            self.liters = null;
            self.price = null;
        }
        var dto = {};
        function save(){
            self.loading = true;
            self.dateTime = $filter('date')(new Date(),'yyyy-MM-dd HH:mm:ss');
            dto = {
                    'eserviceName':self.selectedFuelStation.name,
                    'eserviceId':self.selectedFuelStation._id,
                    'liters':self.liters,
                    'price':self.price,
                    'odometer':self.odometer,
                    'vehicleId':self.selectedUnit._id,
                    'vehicleName':self.selectedUnit.descripcion,
                    'datetime':self.dateTime
            }
            $mdDialog.show({
                controller:ConfirmController,
                controllerAs:'cd',
                locals:{
                    dto: dto
                },
                templateUrl:'src/gasloader/view/confirm.tmpl.html',
                parent:angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: self.customFullscreen
            }).
            then(function(answer){
                if(answer == 'guardar'){

                    self.loading = true
                    FuelConsumption.save(dto,
                        function(response){
                            self.loading = false;
                            console.log(response.Message);
                            showAlert(response.Message);
                            resetForm();
                            self.loading = false;

                        }, function(error){
                            self.loading = false;
                            console.log(error.data.Message);
                            showAlert("ocurrio un error al guardar la carga");
                        })

                    }

            }, function(answer){
                        self.loading = false;
            })
            self.loading = false;

        }
        function ConfirmController($mdDialog, dto){
            selfDialog = this;
            selfDialog.dto = dto;
            selfDialog.hide = function(){
                $mdDialog.hide();
            };
            selfDialog.cancel = function(){
                $mdDialog.cancel();
            };
            selfDialog.answer = function(answer){
                $mdDialog.hide(answer);
            };
        }
        function showAlert(message){
            $mdDialog.show(
                $mdDialog
                    .alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(false)
                    .title('Atencion')
                    .textContent(message)
                    .ariaLabel('Dialog de respuesta')
                    .ok('Ok')
                    .targetEvent()
            );
        };
    }
})();