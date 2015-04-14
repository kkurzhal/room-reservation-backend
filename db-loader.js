var DEBUG = false;
var fs = require('fs');
//var mongo = require('mongodb').MongoClient;

//using the mysql client noted at https://github.com/felixge/node-mysql.
//var mysql = require('mysql');
//var sql = 'INSERT INTO <table-name> (<columns>) VALUES (<values>)';
var fileData = fs.readFileSync('Room_Schedule.csv','utf8').split('\n');
var errorFile = fs.openSync('error.txt', 'w');


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
	//get the current line, remove all double quote characters with a regular expression, and then split into an array by commas
	var line_array = fileData[line].replace(/\","/g, '@').replace(/\"/g, '').split('@');
//	console.log(line_array);

	if( (line_array[0] !== undefined && line_array[0].length !== 0) && (line_array[1] !== undefined && line_array[1].length !== 0) && (line_array[12] !== undefined && line_array[12].length !== 0) && (line_array[13] !== undefined && line_array[13].length !== 0) )
	{
	//	console.log(JSON.stringify(new_request));

		//get each day
		for(var index = 7; index < 12; ++index)
		{
			//create a new request for each day that is requested
			if(line_array[index] == weekdays[index - 6])
			{
				//create a new request from the line with an empty day (this is for creating one request for each day)
				var new_request = 
				{
					building: line_array[0],
					room: line_array[1],
					first_name: line_array[5],
					last_name: line_array[6],
					start_time: line_array[12],
					stop_time: line_array[13],
					day: line_array[index]
				};

				var duplicate = false;
				for(var r_index = requests_arr.length - 1; r_index >= 0; --r_index)
				{
					//if(requests_arr[r_index].building === new_request.building && requests_arr[r_index].room === new_request.room && requests_arr[r_index].first_name === new_request.first_name && requests_arr[r_index].last_name === new_request.last_name && requests_arr[r_index].start_time === new_request.start_time && requests_arr[r_index].stop_time === new_request.stop_time && requests_arr[r_index].day === new_request.day)
					if(JSON.stringify(new_request) === JSON.stringify(requests_arr[r_index]))
					{
						duplicate = true;
					}
				}

				if(!duplicate)
					requests_arr.push(new_request);
			}
			else
			{
				fs.writeSync(errorFile, 'inner on line ' + line + ' - ' + line_array[index] + '!=' + weekdays[index-6] + ' - ' + line_array + '\n');
			}
		}
	}
	else
	{
		fs.writeSync(errorFile, 'outer: ' + line_array + '\n');
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



/*
// Connect to the db
MongoClient.connect("mongodb://localhost:8080/<db-name>", function(err, db) {
  if(!err) {
    console.log("We are connected");
  }
});
*/


//create output file
var outFile = fs.openSync('output.txt', 'w');

for(each in requests_arr)
{
	fs.writeSync(outFile, JSON.stringify(requests_arr[each]) + '\n');
	console.log(JSON.stringify(requests_arr[each]) + '\n');
}

//fs.writeSync(outFile, requests_arr.join('\n'));
fs.closeSync(outFile);
fs.closeSync(errorFile);
