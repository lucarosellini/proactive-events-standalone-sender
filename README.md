## Proactive notification standalone sender

This project aims at simplifying sending proactive events to a skill from an external standalone process. 

At a very high level, this project performs the following operations for each one of the skills configured in [```skills.json```](./skills.json):
1. Obtains the authentication token from Alexa by using the skill ```client_id``` and ```client_secret```.
2. Use the auth token to send the actual notification configured in [```messageAlertEvent.json```](./messageAlertEvent.json) using the message provided in [```skills.json```](./skills.json).

You need to configure the [```skills.json```](./skills.json) file with the list of target skills for notifications. Please remember to configure your skills to use proactive events as described in the [Alexa Proactive Events API documentation](https://developer.amazon.com/docs/smapi/proactive-events-api.html). This project will only send [```AMAZON.MessageAlert.Activated```](https://developer.amazon.com/docs/smapi/schemas-for-proactive-events.html#message-alert) events.

This code will only send ```broadcast``` notifications to all those users having enabled notifications in the skills.

[```skills.json```](./skills.json) is an array of objects with the following properties:

* ```skill_name```: this will only be used for logging purposes.
* ```client_id```: the client_id obtained from the "Permissions" tab of Alexa developer console.
* ```client_secret```: the client_secret obtained from the "Permissions" tab of Alexa developer console.
* ```message```: the message you want to send to skill users.

Event will adhere to the template in [```messageAlertEvent.json```](./messageAlertEvent.json). You might further customize this template if you want.

### Prerequisites

You need Node.js > 10.x to run the code and NPM to install the required dependencies.

How to install these two tools goes beyond the scope of this document.

### Setup

To download project dependencies simply run the following in the project root:

    npm install

### Howto run

You need to pass two command line arguments to properly run this project:
* ```environment```: weather the target events will be sent in the 'live' or 'development' environments. Admitted values are ```dev``` and ```pro```.
* ```region```: identifies the region of the Alexa endpoint to use to send proactive events. Admitted values are ```EU``` (Europe), ```NA``` (North America) and ```FE``` (Far East). **Remember**: if your users are located in NA and you are sending events trough the EU endpoint, users located in NA won't receive any notification.

Once you've configured your skill ```client_id``` and ```client_secret``` in [```skills.json```](./skills.json), you can just run the project as:

    node index.js <environment> <region>

For example:

    node index.js dev EU
