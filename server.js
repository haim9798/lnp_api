//require all needed libraries and extentions 
const express        = require('express');
var sip = require('sip');
var util = require('util');
var os = require( 'os' );
const redis     = require('redis');
const app            = express();

const port = 8000;
const sipPort = "5060";
//find date for logfile name 

var currentDate = getToday('MMDDYYY');

//start of winston logging for use in file 

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
	level: 'info',
	format: combine(
	  timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
	  myFormat, 
	),
	transports: [
	  //
	  // - Write to all logs with level `info` and below to `Gnereal.log` 
	  // - Write all logs error (and below) to `Error.log`.
	  //
	  new transports.File({ filename: 'SIP_LNP_Error_' + currentDate +'.log', level: 'error' }),
	  new transports.File({ filename: 'SIP_LNP_General_'+ currentDate +'.log' })
	]
  });

// find local host IP from first real interface  
var networkInterfaces = os.networkInterfaces();
var serverAddress ='';
for (var Interfaces in networkInterfaces ) {
	if ( ( networkInterfaces[Interfaces][0].address == '127.0.0.1' ) ){
		continue;
	}
	else {
		serverAddress = networkInterfaces[Interfaces][0].address;
		logger.info('found the address : ' + serverAddress + ' in ' + Interfaces );
		break;
	}
}



//connect to local redisDB 
var client    = redis.createClient();
client.on("connect", function() {
	logger.info("You are now connected to Redis DB");
});
//Start the API app 
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const lnpModule =require('./app/lnp');
const api4LNP = lnpModule.api(app, client,logger);

app.listen(port, () => {  logger.info('API is live on port ' + port);});

//start of SIP LNP server 
const sipLnpServer = lnpModule.sipserver(sip,client,util,serverAddress,sipPort, logger);

function getToday(dateFormat){
    var today = new Date();
    var dateDayOfMonth = ''+today.getDate();
    var dateMonthOfYear = ''+(today.getMonth()+1); 
    var dateFullYear =''+today.getFullYear();

	if (dateDayOfMonth.length <2) {
        dateDayOfMonth = '0' + dateDayOfMonth ;
    }
    if(dateMonthOfYear.length < 2) {
        dateMonthOfYear = '0' + dateMonthOfYear ;
    }
    var dateShortYear= dateFullYear.substring(2,5);

    switch (dateFormat) {
        case 'MMDDYYY':
            return [dateMonthOfYear,dateDayOfMonth,dateFullYear].join('');    
        case 'YYYYMMDD' :
            return [dateFullYear,dateMonthOfYear,dateDayOfMonth].join('');    
        case 'MM_DD_YYYY':
            return [dateMonthOfYear,dateDayOfMonth,dateFullYear].join('_');
        case 'DD_MM_YYYY':
            return [dateDayOfMonth,dateMonthOfYear,dateFullYear].join('_');    
        case 'MM/DD/YYYY' :
            return [dateMonthOfYear,dateDayOfMonth,dateFullYear].join('/');
        case 'DD/MM/YYYY' :
            return [dateDayOfMonth,dateMonthOfYear,dateFullYear].join('/');
        case 'MM.DD.YYYY' :
            return [dateMonthOfYear,dateDayOfMonth,dateFullYear].join('.');
        case 'DD.MM.YYYY' :
            return [dateDayOfMonth,dateMonthOfYear,dateFullYear].join('.');
        case 'MMDDYY':
            return [dateMonthOfYear,dateDayOfMonth,dateShortYear].join('');
        case 'MM_DD_YY':
            return [dateMonthOfYear,dateDayOfMonth,dateShortYear].join('_');
        case 'DD_MM_YY':
            return [dateDayOfMonth,dateMonthOfYear,dateShortYear].join('_');    
        case 'MM/DD/YY' :
            return [dateMonthOfYear,dateDayOfMonth,dateShortYear].join('/');
        case 'DD/MM/YY' :
            return [dateDayOfMonth,dateMonthOfYear,dateShortYear].join('/');
        case 'MM.DD.YY' :
            return [dateMonthOfYear,dateDayOfMonth,dateShortYear].join('.');
        case 'DD.MM.YY' :
            return [dateDayOfMonth,dateMonthOfYear,dateShortYear].join('.'); 

    }
    var date = today.getFullYear()+'_'+ (today.getMonth()+1) + '_' +today.getDate();
}