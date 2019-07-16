var rp = require('request-promise');

/**
 * Fetches the access_token from the skill identified by the provided credentials.
 * 
 * @param {string} client_id client id, obtained from the developer console. 
 * @param {string} client_secret client secret, obtained from the developer console.
 */
function fetchToken(client_id, client_secret){
    if (!client_id || !client_secret){
        console.log('client_id and client_secret cannot be null');
        return null;
    }

    var argsData = "grant_type=client_credentials&client_id=" + client_id + "&client_secret="+ client_secret + "&scope=alexa::proactive_events";

    var options = {
        method: 'POST',
        uri: 'https://api.amazon.com/auth/o2/token',
        body: argsData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        transform: function (body) {
            return JSON.parse(body);
        }
    };

    return rp(options);
}

/**
 * Sends the actual notification.
 * 
 * @param {string} access_token the access token used to send the notification.
 * @param {object} event the event to send.
 * @param {object} config the endpoint configuration object.
 */
function sendProactiveEvent(access_token, event, config){
    var options = {
        method: 'POST',
        uri: config.notification_service_url,
        body: JSON.stringify(event),
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + access_token },
        resolveWithFullResponse: true
    };
    
    return rp(options);
}

/**
 * Implements the high level logic.
 * 
 * @param {object} skill skill configuration options. 
 * @param {object} config endpoint configuration options.
 */
async function sendNotification(skill, config){
    fetchToken(skill.client_id, skill.client_secret)
        .then(function (body) {
            // we correctly got the access_token, let's send the notification.
            const messageAlert = require("./messageAlertEvent.json");
            messageAlert.event.payload.messageGroup.creator.name = skill.message;

            const ts = new Date();
            const h = ts.getTime()+(skill.validity_hours*60*60*1000);
            const expiryTime = new Date(h); 

            messageAlert.timestamp = ts.toISOString();
            messageAlert.expiryTime = expiryTime.toISOString();

            return sendProactiveEvent(body.access_token, messageAlert, config);
        })
        .then(function (response){
            console.log("Event sent successfully. statusCode: " + response.statusCode);
        })
        .catch(function (err){
            console.log("caught error while sending proactive event to skill " + skill.skill_name, 
                JSON.stringify(err, null, 2));
            return err;
        });
}

/*
    Command line event parsing.
*/
var myArgs = process.argv.slice(2);

switch (myArgs[0]) {
    case 'dev':
        console.log('Development endpoint selected.');
        break;
    case 'pro':
        console.log('Production endpoint selected.');
        break;
    default:
        console.log('You must specify an enviroment. Valid options are "dev" or "pro".');
        process.exit(1);
}

switch (myArgs[1]) {
    case 'FE':
        console.log('Using Far East endpoint.');
        break;
    case 'EU':
        console.log('Using Europe endpoint.');
        break;
    case 'NA':
        console.log('Using North America endpoint.');
        break;
    default:
        console.log('You must specify a region. Valid options are "NA", "EU" or "FE".');
        process.exit(1);
}

const environment = myArgs[0];
const region = myArgs[1];

const skills = require("./skills.json");

if (!skills || skills.length == 0){
    console.log("skills.json should contain at least one skill.");
}

const invalid_skills = skills.filter(elem => !elem.client_id || !elem.client_secret);

invalid_skills.forEach(elem => console.log("client_id or client_secret not configured for skill.", elem.skill_name))

if (invalid_skills.length > 0){
    console.log("One or more skill credentials are not correctly configured.");
    process.exit(1);
}

const config = require("./config.json").filter(elem => elem.region === region && elem.environment === environment);

if (!config || config.length == 0){
    console.log("Please check the configuration file for any error.");
}

/*
    Triggers event sending.
*/
skills.forEach(skill => {
    sendNotification(skill, config[0]);
});
