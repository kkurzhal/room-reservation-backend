var DEBUG = true;
var fs = require('fs');
//var mongo = require('mongodb').MongoClient;

//using the mysql client noted at https://github.com/felixge/node-mysql.
var mysql = require('mysql');
var fData = [];
var sql = 'INSERT INTO <table-name> (<columns>) VALUES (<values>)';
var fileData = fs.readFileSync('Room_Schedule.csv','utf8').split('\n');

//set up the beginning dates
var start_date = new Date('4/1/15');
var end_date = new Date('4/30/15');
var next_day = Date(start_date.getDate());

//set up the weekday characters; the index matches the weekday int returned by Date.getDay()
var weekdays = ['S', 'M', 'T', 'W', 'R', 'F', 'S'];

var requests_arr = [];

//get rid of the first array element since it contains column headings.
fileData.shift();

var i = 0;
//read the file, split by newlines, throw out data description line and loop through each line
for(line in fileData)
{
	//split the data by commas into an array of values
	//we need to do a check here for duplicate data
//	fData.push(fileData[line].split(','));

	//get the current line, remove all double quote characters with a regular expression, and then split into an array by commas
	new_request = {};
	var line_array = fileData[line].replace(/\"/g, '').split(',');

	//create a new request from the line with an empty day (this is for creating one request for each day)
	var new_request = 
	{
		building: line_array[0],
		room: line_array[1],
		first_name: line_array[5],
		last_name: line_array[6],
		start_time: line_array[12],
		stop_time: line_array[13],
		day: ''
	}

	//get each day
	for(int index = 7; index < 12; ++index)
	{
		//create a new request for each day that is requested
		if(line_array[index] == weekdays[index + 1])
		{
			new_request.day = line_array[index];
			requests_arr.push(new_request);
		}
	}

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
