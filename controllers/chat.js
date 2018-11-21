const express = require('express');
const builder = require('botbuilder');
//const env = process.env;

const app = express();

var inMemoryStorage = new builder.MemoryBotStorage();

function init(app) {
    
    /*
    |--------------------------------------------------------------------------
    |   Bot credential from Microsoft
    |--------------------------------------------------------------------------
    */
    const connector = new builder.ChatConnector({
        appId: '59baffb1-2097-4e7a-b308-cf94eb7b08d1', //should be env.BOT_APP_ID,
        appPassword: 'xmxbpHKF41*khGOVZ555)?_', //should be env.BOT_APP_PASSWORD,
    });

    // Endpoint to connect
    app.post('/api/help', connector.listen());
 
    // Create Bot
    var bot = new builder.UniversalBot(connector, [
        // this section becomes the root dialog
        // If a conversation hasn't been started, and the message
        // sent by the user doesn't match a pattern, the
        // conversation will start here
        (session, args, next) => {
            // Launch the getName dialog using beginDialog
            // When beginDialog completes, control will be passed
            // to the next function in the waterfall
            session.beginDialog('getName');
        },
        (session, results, next) => {
            // executed when getName dialog completes
            // results parameter contains the object passed into endDialogWithResults

            // check for a response
            if (results.response) {
                const name = session.privateConversationData.name = results.response;

                // When calling another dialog, you can pass arguments in the second parameter
                session.beginDialog('getAge', { name: name });
            } else {
                // no valid response received - End the conversation
                session.endConversation(`Sorry, I didn't understand the response. Let's start over.`);
            }
        },
        (session, results, next) => {
            // executed when getAge dialog completes
            // results parameter contains the object passed into endDialogWithResults

            // check for a response
            if (results.response) {
                const age = session.privateConversationData.age = results.response;
                const name = session.privateConversationData.name;

                session.endConversation(`Hello ${name}. You are ${age}`);
            } else {
                // no valid response received - End the conversation
                session.endConversation(`Sorry, I didn't understand the response. Let's start over.`);
            }
        },
    ]
      
    );

    bot.dialog('getName', [
        (session, args, next) => {
            // store reprompt flag
            if(args) {
                session.dialogData.isReprompt = args.isReprompt;
            }

            // prompt user
            builder.Prompts.text(session, 'Hi there! My name is Kate and I\'m here to help you. What is your name?');
        },
        (session, results, next) => {
            const name = results.response;

            if (!name || name.trim().length < 3) {
                // Bad response. Logic for single re-prompt
                if (session.dialogData.isReprompt) {
                    // Re-prompt ocurred
                    // Send back empty string
                    session.endDialogWithResult({ response: '' });
                } else {
                    // Set the flag
                    session.send('Sorry, name must be at least 3 characters.');

                    // Call replaceDialog to start the dialog over
                    // This will replace the active dialog on the stack
                    // Send a flag to ensure we only reprompt once
                    session.replaceDialog('getName', { isReprompt: true });
                }
            } else {
                // Valid name received
                // Return control to calling dialog
                // Pass the name in the response property of results
                session.endDialogWithResult({ response: name.trim() });
            }
        }
    ]);


    bot.dialog('getAge', [
        (session, args, next) => {
            let name = session.dialogData.name = 'User';

            if (args) {
                // store reprompt flag
                session.dialogData.isReprompt = args.isReprompt;

                // retrieve name
                name = session.dialogData.name = args.name;
            }

            // prompt user
            builder.Prompts.number(session, `How old are you, ${name}?`);
        },
        (session, results, next) => {
            const age = results.response;

            // Basic validation - did we get a response?
            if (!age || age < 13 || age > 90) {
                // Bad response. Logic for single re-prompt
                if (session.dialogData.isReprompt) {
                    // Re-prompt ocurred
                    // Send back empty string
                    session.endDialogWithResult({ response: '' });
                } else {
                    // Set the flag
                    session.dialogData.didReprompt = true;
                    session.send(`Sorry, that doesn't look right.`);
                    // Call replaceDialog to start the dialog over
                    // This will replace the active dialog on the stack
                    session.replaceDialog('getAge', 
                        { name: session.dialogData.name, isReprompt: true });
                }
            } else {
                // Valid city received
                // Return control to calling dialog
                // Pass the city in the response property of results
                session.endDialogWithResult({ response: age });
            }
        }
    ]);

}


module.exports.init = init;
