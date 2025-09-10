const lnpApi = require('./lnp_api');
const sipLnp = require('./sip_lnp');
module.exports = {
   api: function(app, client,logger) {  lnpApi(app, client,logger); },
 sipserver: function(sip, client , util,serverAddress ,sipPort , logger) { sipLnp(sip, client , util, serverAddress ,sipPort , logger) }
}

