const lnpApi = require('./lnp_api');
const sipLnp = require('./sip_lnp');
const enumLnp = require('./enum_lnp');
module.exports = {
   api: function(app, client,logger) {  lnpApi(app, client,logger); },
 sipserver: function(sip, client , util,serverAddress ,sipPort , logger) { sipLnp(sip, client , util, serverAddress ,sipPort , logger); }, 
 enmuserver : function (client, dns, serverAddress , enumPort, logger ) { enumLnp(client, dns, serverAddress , enumPort, logger); }
}

