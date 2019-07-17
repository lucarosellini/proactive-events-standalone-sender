## Proactive notification standalone sender

This project aims at simplifying sending proactive events to a skill from an external standalone process. 

For each one of the skills configured in [```skills.json```](./skills.json), this code performs the following operations:
1. Obtains an authentication token from Alexa by using the skill ```client_id``` and ```client_secret```.
2. Uses the authentication token obtained in the previous step to *broadcast* notifications to those users of the skill that granted permissions to notifications. Sent events follow the [```AMAZON.MessageAlert.Activated```](https://developer.amazon.com/docs/smapi/schemas-for-proactive-events.html#message-alert) schema. You can edit the event template in [```messageAlertEvent.json```](./messageAlertEvent.json); the template ```messageAlert.event.payload.messageGroup.creator.name``` is overridden at runtime using the ```message``` property provided in [```skills.json```](./skills.json).

Remember that if you want to send proactive events to your skill, you first need to add notification permissions to the skill and declare the schema(s) you'll be using. This is described in the official [Alexa Proactive Events API documentation](https://developer.amazon.com/docs/smapi/proactive-events-api.html). 

[```skills.json```](./skills.json) is an array of objects with the following properties:

* ```skill_name```: this will only be used for logging purposes.
* ```client_id```: the client_id obtained from the "Permissions" tab of Alexa developer console.
* ```client_secret```: the client_secret obtained from the "Permissions" tab of Alexa developer console.
* ```message```: the message you want to send to skill users.
* ```validity_hours```: number of hours during which this message will be considered valid (defaults to 24).

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
* ```message```: this is optional and lets you override the message property defined in [```skills.json```](./skills.json). The same message will be sent to all configured skills.

Once you've configured your skill ```client_id``` and ```client_secret``` in [```skills.json```](./skills.json), you can just run the project as:

    node index.js -e <environment> -r <region>

For example:

    node index.js -e dev -r EU
