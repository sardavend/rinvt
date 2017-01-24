(function(){
	'use strict'
	angular.module('dashboard')
		   .factory('Load',['$q',Load])
		   .factory('Save',['$q',Save]);

	const emptyDb= "EMPTY";

    function Load($q){
    	return function(db){
	    	//let db = new PouchDB('productdb');
	    	let defer = $q.defer();
	    	db.allDocs({
	    		include_docs:true,
	    		descending:true
	    	}).then(function(response){
	    		if(response.total_rows>0){
	    			return response.rows;
	    		}
	    		return emptyDb;
	    	}).then(function(rows){
	    		if(rows === emptyDb){
	    			defer.reject(rows);
	    		}
	    		rows = rows.map((elem)=>elem.doc);
	    		defer.resolve(rows);
	    	}).catch(function(err){
	    		defer.reject(err);
	    	})
	    	return defer.promise

    	}

    }
    function Save($q){
    	return function(db,newProduct){
    			//db is an instance of PouchDB
    			let defer = $q.defer();
				db.put(newProduct)
				.then(function(){
					return db.get(newProduct._id)
				}).then(function(np){
					defer.resolve(np);
				}).catch(function(err){
					defer.reject(err);
				})
				return defer.promise;
    	}

    }
}
)()