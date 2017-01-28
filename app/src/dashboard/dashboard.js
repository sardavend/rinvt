(function(){
	'use strict'
	angular
		.module('dashboard', ['ngMaterial', 'ngResource', 'ngCookies','login'])
		.controller('DashboardCtrl',["$mdDialog","$timeout","LoginInfo","$document","$location","Load","Save", DashboardCtrl]);

		function DashboardCtrl($mdDialog, $timeout, LoginInfo, $document, $location, Load, Save){
			//Private
			if(LoginInfo.getUser() == undefined){
				$location.path('login').replace()
			}
			var vm = this;
			vm.productDb= new PouchDB('productdb');
			vm.providerDb = new PouchDB('providerdb');
			vm.brandDb = new PouchDB('branddb');
			vm.typeDb = new PouchDB('typedb');
			var remoteCouchProvider = 'http://qampamad:mad14qampa@sardaven.com:5984/providerdb'
			var remoteCouchProduct  = 'http://qampamad:mad14qampa@sardaven.com:5984/productdb'
			var remoteCouchBrand  = 'http://qampamad:mad14qampa@sardaven.com:5984/branddb'
			var remoteCouchType  = 'http://qampamad:mad14qampa@sardaven.com:5984/typedb'
			var syncHandler = vm.providerDb.sync(remoteCouchProvider,{
				live:true,
				retry:true
			});
			var syncHandlerProduct = vm.productDb.sync(remoteCouchProduct,{
				live:true,
				retry:true
			})
			var syncHandlerBrand = vm.brandDb.sync(remoteCouchBrand,{
				live:true,
				retry:true
			});
			var syncHandlerType = vm.typeDb.sync(remoteCouchType,{
				live:true,
				retry:true
			});

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
			//vm.openDeleteProviderDialog = openDeleteProviderDialog;
			vm.openDeleteDialog = openDeleteDialog;
			vm.addBrand = addBrand;
			vm.addType= addType;
			vm.openBuyProduct = openBuyProduct;
			vm.openEditProduct = openEditProduct;
			//vm.openRemoveProductDialog =openRemoveProductDialog;

			Load(vm.providerDb)
						.then(function(providers){
							vm.providerList = providers;
						}).catch(function(err){
							console.log(err);
							console.log("Empty Db, it must be a new user!!");
						});
			Load(vm.typeDb)
						.then(function(types){
							 	//return products;
							 	if (types == undefined){
							 		vm.typesList = [];
							 	}
							 	vm.typesList = types;
						}).then(function(){
							return Load(vm.productDb);
						}).then(function(products){
							if (products == undefined){
								vm.productList = [];
							}
							 vm.productList = products;
							 vm.theProductList = generateTypeList(vm.typesList, vm.productList);
						}).catch(function(err){
							console.log(err);
							console.log("Empty DB, it must be a new user!!");
						})
			/*
			Load(vm.productDb)
						.then(function(products){
							 	//return products;
							 	$timeout(()=>vm.theProductList = generateTypeList(vm.typesList, vm.productList),1)
								

						}).catch(function(err){
							console.log(err);
							console.log("Empty DB, it must be a new user!!");
						});*/


			Load(vm.brandDb)
						.then(function(brands){
							 	//return products;
							 	vm.brandList = brands;
						}).catch(function(err){
							console.log(err)
							vm.brandList = [];
							console.log("Empty DB, it must be a new user!!");
						});
	


			function generateProductTypesList(tp, products){
				return {
					"typeName": tp.name,
					"productList": products.filter((elem)=> elem.type._id == tp._id)
				}
			}

			function generateTypeList(typesList, productList){
				let theProductList = [];
				theProductList = typesList.map((elem) => generateProductTypesList(elem, productList));
				return theProductList;

			}

			function openBuyProduct(product){
				$mdDialog.show({
					controller:BuyProductDialogCtrl,
					controllerAs: "cd",
					locals:{
						providerList: vm.providerList,
						product: product
					},
					templateUrl:"src/dashboard/view/buyProduct.tmpl.html",
					parent: angular.element(document.body),
					//targetEvent: ev,
					clickOutsideToClose : true,
					fullscreen: true
				}).then(function(buyed){
					//vm.createNewProduct(np);
					addNewItemProducts(buyed, vm.productDb);


				}).catch(function(err){
					console.log(err);
				});

			}

			function BuyProductDialogCtrl($mdDialog, product, providerList){
				let vpd = this;
				vpd.product = product;
				vpd.providerList = providerList;
				vpd.close = close;
				vpd.save = save;

				function close() {
					$mdDialog.cancel();
				}

				function save(quantity){
					let buyData = {
						product: vpd.product,
						quantity: vpd.quantity,
						provider: vpd.selectedProvider
					}
					$mdDialog.hide(buyData); //Go to Then on openBuyProducts
				}
			}

			function addNewItemProducts(buyed, db){
				//buyed.product.quantity = buyed.product.quantity + buyed.quantity;
				buyed.product.quantity += buyed.quantity;
				let index = buyed.product.providers.map((elem)=>elem.prov_id._id).indexOf(buyed.provider._id);
				if(index >= 0){
					buyed.product.providers[index].quantity += buyed.quantity
				} else {
					buyed.product.providers.push({
						prov_id:{
							_id:buyed.provider._id,
							name:buyed.provider.name,
						},
						quantity: buyed.quantity
					})
				}

				Save(db, buyed.product)
					.then(function(np){
						//vm.productList.push(np);
						let idx = typeLookup(vm.typesList, np.type.name);
						if(idx >= 0){
							let pidx = vm.theProductList[idx].productList.map((elem)=> elem._id).indexOf(np._id);
							vm.theProductList[idx].productList[pidx] = np;	
							//vm.theProductList[idx].productList.push(np);

						}

					})

			}

			function openEditProduct(product){
					$mdDialog.show({
					controller:EditProductDialogCtrl,
					controllerAs: "cd",
					locals:{
						//providerList: vm.providerList,
						product: product
					},
					templateUrl:"src/dashboard/view/editProduct.tmpl.html",
					parent: angular.element(document.body),
					//targetEvent: ev,
					clickOutsideToClose : true,
					fullscreen: true
				}).then(function(buyed){
					//vm.createNewProduct(np);
					addNewItemProducts(buyed, vm.productDb);


				}).catch(function(err){
					console.log(err);
				});


			}
			function EditProductDialogCtrl($mdDialog, product){
				let epd = this;
				epd.product = product;
				epd.close = close;
				function close(){
					$mdDialog.cancel();
				}
			}

			/*function openRemoveProductDialog(index, tpl){
				let confirmDeletion = $mdDialog.confirm()
					.title("Estas seguro que deseas eliminar?")
					.textContent('Toda referencia a ' + vm.productList[index].name +" sera eliminada")
					.ariaLabel('delete confirm')
					.ok('Eliminar')
					.cancel('No por favor');

				$mdDialog
					.show(confirmDeletion)
					.then(function(){
						//return vm.productDb.remove(vm.productList[index]);
						return vm.productDb.remove(tpl[index]);
				    }).then(function(result){
				    	//vm.productList.splice(index,1);
				    	tpl.splice(index, 1);


				    }).catch(function(err){
				    	console.log(err);
					})
			};*/

			function addBrand(name){
				let _id = LoginInfo.getUser() +"-" + new Date().toISOString();
				Save(vm.brandDb,{"_id":_id,"name":name})
							.then(function(nb){
								vm.brandList.push(nb);
							}).catch(function(err){
								console.log(err);
							});
			}

			function addType(name, description){
				let _id = LoginInfo.getUser() +"-" + new Date().toISOString();
				Save(vm.typeDb,{"_id":_id, "name":name, "description":description})
								.then(function(nt){
									vm.typesList.push(nt);
									vm.theProductList.push({
										"typeName":nt.name,
										"productList":[],
									});
								}).catch(function(err){
									console.log(err);
								});
			}


			function openCreateProductDialog(ev){
				$mdDialog.show({
					controller:CreateProductDialogCtrl,
					controllerAs: "cd",
					locals:{
						providerList: vm.providerList,
						brandList: vm.brandList,
						typesList: vm.typesList
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
			function CreateProductDialogCtrl($mdDialog, providerList, $document, typesList, brandList){ //item o producto
				$document.find('input').on('keydown', function(ev) {
	          				ev.stopPropagation();
	        			})
				let vmpd = this;

				vmpd.cancel = cancel;
				vmpd.save = save;
				vmpd.providerList = providerList;
				vmpd.typesList= typesList;
				vmpd.brandList = brandList;
				vmpd.mesUnits = ["Kg","Mt", "Pza", "Lt","cm","cm2"];

				if(vmpd.brandList.length ==  0){
					vmpd.searchBrandMessage = "No creaste ninguna marca!";
				} else {
					vmpd.searchBrandMessage = "Buscar una marca...";
				}
				if(vmpd.typesList.length  == 0){
					vmpd.searchTypeMessage = "No creaste ningun tipo!";
				} else {
					vmpd.searchTypeMessage = "Buscar un producto";
				}


				function cancel(){
					$mdDialog.cancel();
				}
				function save(){
					let newProduct = {
						newProductName: vmpd.newProductName,
						newProductDescription: vmpd.newProductDescription,
						newProductBrand: {
							"_id":vmpd.selectedBrand._id,
							"name":vmpd.selectedBrand.name
						},
						newProductType: {
							"_id":vmpd.selectedType._id,
							"name":vmpd.selectedType.name
						},
						newProductBuyPrice: vmpd.newProductBuyPrice,
						newProductSellPrice: vmpd.newProductSellPrice,
						newProductQuantity: vmpd.newProductQuantity,
						newProductProviderId: {
							"_id":vmpd.selectedProvider._id,
							"name":vmpd.selectedProvider.name
						}
					}
					$mdDialog.hide(newProduct);
				}


			}

			function createNewProduct(np){
				const savedProduct= saveProduct(np);
				//const productListUpdated = addNewProduct(savedProduct);
				//updateProductListBinding(productListUpdated);
			}
			function typeLookup(typesList, typeName){
				return typesList.map((elem)=>elem.name).indexOf(typeName)
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
				Save(vm.productDb,newProduct)
						.then(function(np){
							vm.productList.push(np);
							let idx = typeLookup(vm.typesList, np.type.name);
							if(idx >= 0){
								vm.theProductList[idx].productList.push(np);

							}
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


			//function openDeleteProviderDialog(index, list, db){
			function openDeleteDialog(index, list, db){
				let confirmDeletion = $mdDialog.confirm()
					.title("Estas seguro que deseas eliminar?")
					//.textContent('Toda referencia a ' + vm.providerList[index].name +" sera eliminada")
					.textContent('Toda referencia a ' + list[index].name +" sera eliminada")
					.ariaLabel('delete confirm')
					.ok('Eliminar')
					.cancel('No por favor');

				$mdDialog
					.show(confirmDeletion)
					.then(function(){
						//return vm.providerDb.remove(vm.providerList[index]);
						return db.remove(list[index]);
				    	}).then(function(result){
				    		list.splice(index,1);

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
				Save(vm.providerDb, newProvider)
						.then(function(np){
							vm.providerList.push(np);
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

		};
}
)()