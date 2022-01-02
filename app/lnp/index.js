const lnpApi = require('./lnp_api');
const sipLnp = require('./sip_lnp');
const enumLnp = require('./enum_lnp');
module.exports = {
   api: function(app, masterClient,slaveClient,logger) {  lnpApi(app, masterClient,slaveClient,logger); },
 sipserver: function(sip, slaveClient , util,serverAddress ,sipPort , logger) { sipLnp(sip,slaveClient , util, serverAddress ,sipPort , logger); }, 
 enmuserver : function (slaveClient, dns, serverAddress , enumPort, logger ) { enumLnp(slaveClient, dns, serverAddress , enumPort, logger); }
}

