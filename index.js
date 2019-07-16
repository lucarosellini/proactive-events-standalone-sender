var rp = require('request-promise');

function fetchToken(client_id, client_secret){
    if (!client_id || !client_secret){
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

function sendProactiveEvent(access_token, event, config){
    console.log(JSON.stringify(config));
    
    var options = {
        method: 'POST',
        uri: config.notification_service_url,
        body: JSON.stringify(event),
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + access_token },
        resolveWithFullResponse: true
    };
    
    console.log("options: ", JSON.stringify(options));

    return rp(options);
}

async function sendNotification(skill, config){
    fetchToken(skill.client_id, skill.client_secret)
        .then(function (body) {
            // we correctly got the access_token, let's send the notification.

            const messageAlert = require("./messageAlertEvent.json");
            messageAlert.event.payload.messageGroup.creator.name = skill.message;
            return sendProactiveEvent(body.access_token, messageAlert, config);
        })
        .then(function (response){
            console.log(response.statusCode);
        })
        .catch(function (err){
            console.log("caught error while sending proactive event to skill " + skill.skill_name, 
                JSON.stringify(err, null, 2));
            return err;
        });
}

var myArgs = process.argv.slice(2);

switch (myArgs[0]) {
    case 'dev':
        console.log('Development environment selected.');
        break;
    case 'pro':
        console.log('Production environment selected.');
        break;
    default:
        console.log('You must use an enviroment. Valid options are "dev" or "pro".');
        process.exit(1);
}

switch (myArgs[1]) {
    case 'FE':
        console.log('Far East region selected.');
        break;
    case 'EU':
        console.log('Europe region selected.');
        break;
    case 'NA':
        console.log('North America region selected.');
        break;
    default:
        console.log('You must select a region. Valid options are "NA", "EU" or "FE".');
        process.exit(1);
}

const environment = myArgs[0];
const region = myArgs[1];

console.log(region);
console.log(environment);

const skills = require("./skills.json");
const config = require("./config.json").filter(elem => elem.region === region && elem.environment === environment);

if (!config || config.length == 0){
    console.log("Please check the configuration file for any error.");
}

skills.forEach(skill => {
    sendNotification(skill, config[0]);
});
