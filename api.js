var express = require('express');
var app = express();

//https://github.com/mongodb/node-mongodb-native
//http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html
var mongo = require('mongodb').MongoClient;
port = 8019;

//route definition
app.get('/buildings', function(req, response) {  
	// Connect to the db
  	mongo.connect("mongodb://localhost:27017/rooms/", function(err, db) {
			
    	//continue if there is no error
		if(!err)
    	{
			var collection = db.collection('requests');
              
 			var buildings = collection.distinct('building', function(err, results){
                response.json({results: results});
                response.end();
			});
		}
	});
 });

app.listen(port);
console.log('Running API on port ' + port);
