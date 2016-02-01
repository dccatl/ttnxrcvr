//
// Sample web push receiver
//	Recieves data pushed from Numerex gateway.  Devices on ThingTech account have this receiver configured as an end-point:
//		URL:	https://ttwebrcvr.thingtech.com
//      Credentials:
//			User: ttnxusr
//			Password: tt!0T
//
//            Revision History:
//            ===============================================================
//            2014-08-21: DCC - Genesis

var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var mysql = require('mysql');

var options = {
	pfx: fs.readFileSync('ttwebrcvr.pfx'),
	passphrase: 'tt!0T',
	requestCert: true
};

var app = express();

// Credentials used to access this service
var auth = express.basicAuth(function(user, pass) {
	return (user == "ttnxusr" && pass == "tt!0T");
},'Authentication required');

app.use(express.logger());
app.use(express.bodyParser());

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'ttusr',
	password : 'tt!0T',
	database : 'tt_nxrcvr'
});

connection.connect(function(err) {
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}
	console.log('connected as id ' + connection.threadId);
});

// system_status GET method specified by Numerex API
app.get('/system_status', auth, function (req, res) {
	 console.log("System status check");
	 var body = 'true';
	 res.send(body);
});

// message POST method to receive data from Numerex
app.post('/message', auth, function (req, res) {
	//Response to Numerex API
	 var body = 'OK';
	 res.send(body);

	// Parse message and assign data element values to variables
	 var parsedResponse = JSON.parse(JSON.stringify(req.body));
	 var lat = parsedResponse.data.gps_latitude;
	 var lon = parsedResponse.data.gps_longitude;
	 var ts = parsedResponse.data.gps_timestamp;
	 var speed = parsedResponse.data.gps_speed;
	 var hdg = parsedResponse.data.gps_heading;
	 var alt = parsedResponse.data.gps_altitude;
	 var dvc = parsedResponse.data.device_name;
	 var msgID = parsedResponse.id;
	 var rssi = parsedResponse.data.cellular_rssi;
	 var dvcType = parsedResponse.data.device_type;
	 var svcType = parsedResponse.data.service_type;
	 var evntType = parsedResponse.data.event_type;
	 var igntn = parsedResponse.data.ignition;
	 var msbSeqNo = parsedResponse.data.seq_num_msb;
	 var digital01 = parsedResponse.data.digital_input_01;
	 var evntCode = parsedResponse.data.event_code;
	 var digital02 = parsedResponse.data.digital_input_02;
	 var digital03 = parsedResponse.data.digital_input_03;
	 var fixType = parsedResponse.data.gps_fix_type;
	 var hdop = parsedResponse.data.gps_hdop;
	 var NumSat = parsedResponse.data.gps_number_of_satellites;
	 var lsbSeqNo = parsedResponse.data.seq_num_lsb;
	 var acc01 = parsedResponse.data.accumulator_01;
	 var rtcTs = parsedResponse.data.rtc_timestamp;
	 var acc02 = parsedResponse.data.accumulator_02;
	 var digital06 = parsedResponse.data.digital_input_06;
	 var digital04 = parsedResponse.data.digital_input_04;
	 var digital05 = parsedResponse.data.digital_input_05;
	 var SeqNo = parsedResponse.data.sequence_number;
	 var dvcNmType = parsedResponse.data.device_name_type;
	 var dvcPort = parsedResponse.data.device_port;
	 var msgTyp = parsedResponse.data.message_type;
	 var dvcIP = parsedResponse.data.device_ip;
	 var msgTs = parsedResponse.timestamp;

	 console.log('\rJSON Message: ' + JSON.stringify(req.body));

	 console.log('\rParsed data:');
	 console.log('\r================================================');
	 console.log('\r\Device:= '+ dvc );
	 console.log('\r\Time:= '+ ts );
	 console.log('\rLat:= '+ lat );
	 console.log('\rLon:= '+ lon );
	 console.log('\rHeading:= '+ hdg );
	 console.log('\rAlt:= '+ alt );
	 console.log('\rSpeed:= '+ speed + '\n');

// array to hold parsed values of all data elements
	var post  = {
					msgID: msgID,
					msgTimeStamp: msgTs,
					gps_latitude: lat,
					gps_longitude: lon,
					device_name: dvc,
					gps_timestamp: ts,
					gps_heading: hdg,
					gps_speed: speed,
					gps_altitude: alt,
					cellular_rssi: rssi,
					device_type: dvcType,
					service_type: svcType,
					event_type: evntType,
					seq_num_msb: msbSeqNo,
					digital_input_01: digital01,
					event_code: evntCode,
					digital_input_02: digital02,
					digital_input_03: digital03,
					gps_fix_type: fixType,
					gps_hdop: hdop,
					gps_number_of_satellites: NumSat,
					seq_num_lsb: lsbSeqNo,
					accumulator_01: acc01,
					accumulator_02: acc02,
					rtc_timestamp: rtcTs,
					digital_input_04: digital04,
					digital_input_05: digital05,
					digital_input_06: digital06,
					sequence_number: SeqNo,
					device_name_type: dvcNmType,
					device_port: dvcPort,
					device_ip: dvcIP
					};

	// Insert data elements into db and log INSERT statement
	var query = connection.query('INSERT INTO tblreadingmsg SET ?', post, function(err, result) {
	});
	console.log(query.sql);
});

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
console.log('App started')
