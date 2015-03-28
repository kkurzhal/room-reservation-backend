var fs = require('fs');
//var mongo = require('mongodb').MongoClient;
var fData = [];
var sql = 'INSERT INTO <table-name> (<columns>) VALUES (<values>)';
var fileData = fs.readFileSync('Room_Schedule.csv','utf8').split('\n');

fileData.shift();
//console.log(fileData);


var i = 0;
//read the file, split by newlines, throw out data description line and loop through each line
for(line in fileData)
{
	//split the data by commas into an array of values
	//we need to do a check here for duplicate data
	fData.push(fileData[line].split(','));
	console.log(fileData[line]);

	if(i > 5)
		break;
	else
		i += 1;
}

console.log(fData);

/*
// Connect to the db
MongoClient.connect("mongodb://localhost:8080/<db-name>", function(err, db) {
  if(!err) {
    console.log("We are connected");
  }
});
*/
