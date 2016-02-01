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
//			  2015-05-07: DCC - Modified to insert deviceID from tblDevice (revised schema)

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

 	var post  = [msgID,
				msgTs,
				lat,
				lon,
				dvc,
				ts,
				hdg,
				speed,
				alt,
				rssi,
				dvcType,
				svcType,
				evntType,
				msbSeqNo,
				digital01,
				evntCode,
				digital02,
				digital03,
				fixType,
				hdop,
				NumSat,
				lsbSeqNo,
				acc01,
				acc02,
				rtcTs,
				digital04,
				digital05,
				digital06,
				SeqNo,
				dvcNmType,
				dvcPort,
				dvcIP,
				dvc];

	var qryStr =	'insert into tblreadingmsg ( msgID, msgTimeStamp, gps_latitude, gps_longitude, device_name, gps_timestamp, gps_heading, gps_speed, \
		gps_altitude, cellular_rssi, device_type, service_type, event_type, seq_num_msb, digital_input_01, event_code, digital_input_02, digital_input_03, \
		gps_fix_type, gps_hdop, gps_number_of_satellites, seq_num_lsb, accumulator_01, accumulator_02, rtc_timestamp, digital_input_04, digital_input_05, \
		digital_input_06,  sequence_number, device_name_type, device_port, device_ip, deviceid ) VALUES \
		( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, (select deviceid from tbldevice where esn = ?))';
	var query = connection.query(qryStr, post, function(err, result) {
	});
	console.log(query.sql);
});

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
console.log('App started')
