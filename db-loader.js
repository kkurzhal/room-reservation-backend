var DEBUG = false;
var fs = require('fs');
var mongo = require('mongodb').MongoClient;

//using the mysql client noted at https://github.com/felixge/node-mysql.
//var mysql = require('mysql');
//var sql = 'INSERT INTO <table-name> (<columns>) VALUES (<values>)';
var fileData = fs.readFileSync('Room_Schedule.csv','utf8').replace(/\r/g, '').split('\n');
var errorFile = fs.openSync('error.txt', 'w');


//set up the beginning dates
var start_date = new Date('4/1/15');
var end_date = new Date('4/30/15');
var each_day = new Date(start_date);

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
					firstName: line_array[5],
					lastName: line_array[6],
					startTime: line_array[12],
					stopTime: line_array[13],
					day: line_array[index]
				};

				var duplicate = false;
				for(var r_index = requests_arr.length - 1; r_index >= 0; --r_index)
				{
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

var final_requests = [];

//get data to determine room types
fileData = fs.readFileSync('room_types.csv','utf8').replace(/\r/g, '').split('\n');
fileData.shift();
var types = [];
for(index in fileData)
{
	types.push(fileData[index].split(','));
}


//get the proper dates for each request
//we have to do this funky check because there are no dates that can be equal
while(!(each_day > end_date))
{
	var day = each_day.getDay();
	//continue to add the date only if the current day is not Saturday or Sunday
	if(day != 0 && day != 6)
	{
		//loop through each request
		for(index in requests_arr)
		{
			var request = requests_arr[index];
			if(request.day == weekdays[day])
			{
				var new_request = 
				{
					building: request.building,
					room: request.room,
					firstName: request.firstName,
					lastName: request.lastName,
					startTime: request.startTime,
					stopTime: request.stopTime,
					date: new Date(each_day),
					system: 1,
					approved: 1
				};

				//get the room types
				for(var type_index = 0; type_index < types.length; ++type_index)
				{
					if(types[type_index][4] == request.building + ' ' + request.room)
					{
						new_request.type = types[type_index][2];
						new_request.capacity = types[type_index][3];
					}
				}

				final_requests.push(new_request);
			}
		}
	}

	//increment to the next day
	each_day.setDate(each_day.getDate() + 1);
}



// Connect to the db
mongo.connect("mongodb://localhost:27017/rooms", function(err, db) {
	console.log(err);

	if(!err)
	{
		var collection = db.collection('requests');

		//remove the old documents
		collection.remove({system: 1}, function(err, result){
			var db_file = fs.openSync('db_remove.txt', 'w');
			if(!err)
				fs.writeSync(db_file, result);
			else
				fs.writeSync(db_file, err);

			fs.closeSync(db_file);


			var insert_requests = [];
			var completed_list = [];

			//get the number of expected groups of insertions, use ceil() to round upward
			var total_inserts = Math.ceil(final_requests.length / 1000);
			console.log('Total requests: ' + final_requests.length + '; Divided inserts: ' + total_inserts + '\n');
/*			if(final_requests.length % 1000 > 0)
			{
				total_inserts = total_inserts;
				console.log('With modulus: ' + total_inserts + '\n');
			}
*/
			//insert the new documents
			for(index in final_requests)
			{
				//prepare a batch size of 1000
				insert_requests.push(final_requests[index]);
				
				if(insert_requests.length == 1000 || index + 1 == final_requests.length)
				{
					collection.insert(insert_requests, function(err, result){
						var db_file = fs.openSync('db_insert.txt', 'a');
						if(!err)
							fs.writeSync(db_file, result + '\n');
						else
							fs.writeSync(db_file, err + '\n');

						//put the result into the list of completed requests
						completed_list.push(result);

						fs.writeSync(db_file, 'Completed: ' + completed_list.length + '; Total: ' + total_inserts + '\n');

						fs.closeSync(db_file);

						//close the connection if the number of completed insertion requests matches the number of expected insertion groups
						if(completed_list.length == total_inserts)
							db.close();
					});

					insert_requests = [];
				}
			}
		});

//		console.log("We are connected");
	}
});


//create output file
var outFile = fs.openSync('output.txt', 'w');
var finalFile = fs.openSync('final_output.txt', 'w');

for(each in requests_arr)
{
	fs.writeSync(outFile, JSON.stringify(requests_arr[each]) + '\n');
//	console.log(JSON.stringify(requests_arr[each]) + '\n');
}

for(each in final_requests)
{
	fs.writeSync(finalFile, JSON.stringify(final_requests[each]) + '\n');
}

//fs.writeSync(outFile, requests_arr.join('\n'));
fs.closeSync(outFile);
fs.closeSync(errorFile);
