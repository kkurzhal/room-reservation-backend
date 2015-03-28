var DEBUG = false;
var fs = require('fs');
//var mongo = require('mongodb').MongoClient;

//using the mysql client noted at https://github.com/felixge/node-mysql.
var mysql = require('mysql');
var fData = [];
var sql = 'INSERT INTO <table-name> (<columns>) VALUES (<values>)';
var fileData = fs.readFileSync('Room_Schedule.csv','utf8').split('\n');

//get rid of the first array element since it contains column headings.
fileData.shift();

var i = 0;
//read the file, split by newlines, throw out data description line and loop through each line
for(line in fileData)
{
	//split the data by commas into an array of values
	//we need to do a check here for duplicate data
	fData.push(fileData[line].split(','));

	if(DEBUG)
	{
		console.log(fileData[line]);

		if(i > 5)
			break;
		else
			i += 1;
	}
}

if(DEBUG)
	console.log(fData);



/*
// Connect to the db
MongoClient.connect("mongodb://localhost:8080/<db-name>", function(err, db) {
  if(!err) {
    console.log("We are connected");
  }
});
*/
