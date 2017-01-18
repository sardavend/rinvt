(function(){
	'use strict'
	angular
		.module('dashboard', ['ngMaterial', 'ngResource', 'ngCookies','login'])
		.controller('DashboardCtrl',["$mdDialog","$timeout","LoginInfo","$document","$location", DashboardCtrl]);

		function DashboardCtrl($mdDialog, $timeout, LoginInfo, $document, $location){
			//Private
			if(LoginInfo.getUser() == undefined){
				$location.path('login').replace()
			}
			var vm = this;
			var productDb= new PouchDB('productdb');
			var providerDb = new PouchDB('providerdb');
			var remoteCouchProvider = 'http://qampamad:mad14qampa@192.168.0.12:5984/providerdb'
			var remoteCouchProduct  = 'http://qampamad:mad14qampa@192.168.0.12:5984/productdb'
			var syncHandler = providerDb.sync(remoteCouchProvider,{
				live:true,
				retry:true
			}).on('complete', function(){
				console.log("Synced");

			}).on('change', function(change){
				console.log("Changed: " + change)

			}).on('paused', function(info){
				console.log("paused: " + info)

			}).on('active', function(info){
				console.log("active: " + info)

			}).on('error', function(err){
					console.log("an error has ocurred: " + err);
			});

			var syncHandlerProduct = productDb.sync(remoteCouchProduct,{
				live:true,
				retry:true
			})


			//Public
			//PRODUCTS
			vm.productList = [];
			vm.openCreateProductDialog = openCreateProductDialog;

			//PROVIDERS
			vm.providerList = [];
			vm.createNewProduct = createNewProduct;
			vm.openCreateProviderDialog = openCreateProviderDialog;
			vm.createNewProvider = createNewProvider;
			vm.updateProviderListBinding = updateProviderListBinding;
			vm.saveProvider = saveProvider;
			vm.openDeleteProviderDialog = openDeleteProviderDialog;
			providerDb.allDocs({
					 include_docs:true,
					 descending:true
					}).then(function(allProviders){
						if(allProviders.total_rows > 0){
							return allProviders.rows;
						}
						showMessage("No creaste ningun Proveedor")
						return []
					}).then(function(rows){
						vm.providerList = rows
											.map((elem)=> elem.doc);
					})
					.catch(function(err){
						if(err.name === "not_found"){
							console.log("empty database");
						}
					})


			//

			function openCreateProductDialog(ev){
				$mdDialog.show({
					controller:CreateProductDialogCtrl,
					controllerAs: "cd",
					locals:{
						providerList: vm.providerList

					},
					templateUrl:"src/dashboard/view/createProduct.tmpl.html",
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose : true,
					fullscreen: true
				}).then(function(np){
					vm.createNewProduct(np);
				}).catch(function(err){
					console.log(err);
				});
			};
			function CreateProductDialogCtrl($mdDialog, providerList, $document){ //item o producto
				$document.find('input').on('keydown', function(ev) {
	          		ev.stopPropagation();
	        	})
				let vmpd = this;
				vmpd.cancel = cancel;
				vmpd.save = save;
				vmpd.providerList = providerList;


				function cancel(){
					$mdDialog.cancel();
				}
				function save(){
					let newProduct = {
						newProductName: vmpd.newProductName,
						newProductDescription: vmpd.newProductDescription,
						newProductBrand: vmpd.newProductBrand,
						newProductType: vmpd.newProductType, //TIPO
						newProductBuyPrice: vmpd.newProductBuyPrice,
						newProductSellPrice: vmpd.newProductSellPrice,
						newProductQuantity: vmpd.newProductQuantity,
						newProductWarehouseId: vmpd.newProductWarehouseId,
						newProductProviderId: vmpd.selectedProvider._id
					}
					$mdDialog.hide(newProduct);
				}


			}

			function createNewProduct(np){
				const savedProduct= saveProduct(np);
				//const productListUpdated = addNewProduct(savedProduct);
				//updateProductListBinding(productListUpdated);
			}

			function saveProduct(np){

				let _id = LoginInfo.getUser() +"-" + new Date().toISOString();
				//_id = new Date().toISOString();
				let newProduct = {
					_id: _id,
					name: np.newProductName,
					description: np.newProductDescription,
					brand: np.newProductBrand,
					type: np.newProductType,
					buyPrice: np.newProductBuyPrice,
					sellPrice: np.newProductSellPrice,
					quantity:np.newProductQuantity,
					//warehouseId: np.newProductWarehouseId,
					userId:LoginInfo.getUser(),
					providers:[{
						prov_id:np.newProductProviderId,
						quantity:np.newProductQuantity
					}],
					img:"assets/svg/item_no_img.svg",

				};
				productDb.put(newProduct)
					.then(function(){
						return productDb.get(_id)
					}).then(function(np){
						$timeout(()=>vm.productList.push(np),0);
					}).catch(function(err){
						console.log(err);
					})
			}

			//Inpure Function

			function showMessage(message){
				vm.showMessage = true;
				vm.message = message;
			}
			function updateProductListBinding(productListUpdated){
				vm.productList = productListUpdated;
			}


			function openDeleteProviderDialog(index){
				let confirmDeletion = $mdDialog.confirm()
					.title("Estas seguro que deseas eliminar?")
					.textContent('Toda referencia a' + vm.providerList[index].name +" sera eliminada")
					.ariaLabel('delete confirm')
					.ok('Eliminar')
					.cancel('No por favor');

				$mdDialog
					.show(confirmDeletion)
					.then(function(){
						return providerDb.remove(vm.providerList[index]);
				    }).then(function(result){
				    	vm.providerList.splice(index,1);

				    }).catch(function(err){
				    	console.log(err);
					})
			};

			function openCreateProviderDialog(ev){
				$mdDialog.show({
					controller:CreateProviderDialogCtrl,
					controllerAs: "cd",
					size:'md',
					templateUrl:"src/dashboard/view/createProvider.tmpl.html",
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose : true,
					fullscreen: true
				}).then(function(np){
					vm.createNewProvider(np);
				}).catch(function(err){
					console.log(err);
				});
			};
			//
			function CreateProviderDialogCtrl($mdDialog){
				let vmd = this;
				vmd.cancel = cancel;
				vmd.save = save;


				function cancel(){
					$mdDialog.cancel();
				}
				function save(){
					let newProvider = {
						newProviderName: vmd.newProviderName,
						newProviderDescription: vmd.newProviderDescription,
						newProviderAddress: vmd.newProviderAddress
					}
					$mdDialog.hide(newProvider);
				}


			}
			//PRODUCTS

			function addNewProduct(np, productList){
				productList.push(np);
				return productList;
			}
			//PROVIDERS
			function saveProvider(np){
				let _id = LoginInfo.getUser() + "-" + new Date().toISOString();
				//let _id = new Date().toISOString();
				let newProvider = {
					_id:_id,
					name:np.newProviderName,
					description:np.newProviderDescription,
					address:np.newProviderAddress,
					img:"assets/svg/item_no_img.svg",
				};
				providerDb.put(newProvider)
							.then(function(){
								return providerDb.get(_id);
							}).then(function(newProv){
								 $timeout(()=>vm.providerList.push(newProv),0);
							}).catch(function(err){
								console.log(err);
							})
			}
			function addNewProvider(np, providerList){
				providerList.push(np);
				return providerList;
			}
			function updateProviderListBinding(savedProvider){
				vm.providerList.push(savedProvider);
			}
			function createNewProvider(np){
				const savedProvider = vm.saveProvider(np);
				//const providerListUpdated = addNewProvider(savedProvider);
				//updateProviderListBinding(savedProvider); 
			}





			vm.products = [
			{
				"name":"Correa Pesados",
				"description":"Correas para uso en maquinaria pesada",
				"id":"32234dfasg",
				"img":"assets/svg/item_no_img.svg"
			},
			{
				"name":"Correa Livianos",
				"description":"Correas para uso en maquinaria pesada",
				"id":"32234dfasg",
				"img":"assets/svg/item_no_img.svg"
			},
			{
				"name":"Filtro f33",
				"description":"Correas para uso en maquinaria pesada",
				"id":"32234dfasg",
				"img":"assets/svg/item_no_img.svg"
			}
			]
			vm.warehouses = [
			{
				"name":"Almacen Okinawa",
				"numOfProducts":50
			},
			{
				"name":"Almacen Santa Cruz",
				"numOfProducts":28
			},
			{
				"name":"Almacen San Juan",
				"numOfProducts":200
			}
			]
		};
}
)()