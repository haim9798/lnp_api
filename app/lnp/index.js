const lnpApi = require('./lnp_api');
const sipLnp = require('./sip_lnp');
module.exports = {
   api: function(app, client) {  lnpApi(app, client); },
 sipserver: function(sip, client , util,serverAddress ,sipPort) { sipLnp(sip, client , util, serverAddress ,sipPort) }
}

