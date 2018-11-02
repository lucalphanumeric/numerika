var express = require('express');
var builder = require('botbuilder');

const app = express();

var inMemoryStorage = new builder.MemoryBotStorage();

function init(app){
    /*
    |--------------------------------------------------------------------------
    |   Bot credential from Microsoft
    |--------------------------------------------------------------------------
    */
    const connector = new builder.ChatConnector({
        appId: '59baffb1-2097-4e7a-b308-cf94eb7b08d1', //should be env.BOT_APP_ID,
        appPassword: 'xmxbpHKF41*khGOVZ555)?_', //should be env.BOT_APP_PASSWORD,
    });

    // Endpoint to connect | Listen to messages from the users
    app.post('/api/help', connector.listen());


    // Create bot with a function to receive messages from the user
    var bot = new builder.UniversalBot(connector);

    // Make sure we add code to validate these fields
    var luisAppId = process.env.LuisAppId || 'b53dde3a-15fd-45dc-994d-335575f40ce2';
    var luisAPIKey = process.env.LuisAPIKey || 'bd9819c60a8b42fda1fad4d27cf0d2bf';
    var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

    const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

    // Main dialog with LUIS
    var recognizer = new builder.LuisRecognizer(LuisModelUrl);
    var intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('Greeting', [
        (session) => {
            builder.Prompts.text(session, 'My name is Alphabot and I\'m here to help you understand more about our company Alphanumeric Systems! What is your name?');
        },
        (session, results) => {
            //session.dialogData.name = results.response;
            session.send('Hello ' + results.response + '! How may I help you? Type \'help\' if you don\'t know what to ask', session.message.text);
        },
    ])
    .matches('Help', (session) => {
        session.send('You can ask anything that you want to know about Alphanumeric Systems! \n You can ask me about: \n - The history of the company \n - Our values \n - Location of the offices \n - Development Opportunities \n - Employee hapiness \n - Available positions \n - Service Desk \n - What is LTE \n - Turnover rate \n - Benefits available \n - Number of employees \n\n You can say \'bye\' to end the conversation.', session.message.text);
    })
    .matches('History', (session) => {
        session.send('Alphanumeric Systems has been around since 1979 providing worldwide, multi-language IT support, covering different lines of business such as Salesforce, Vaccines, Finance, facilities and many more.', session.message.text);
    })
    .matches('Values', (session) => {
        session.send('We believe that people are the most important ingredient of our company, creating an environment based on trust, fairness, transparency and respect.', session.message.text);
    })
    .matches('Offices', (session) => {
        session.send('We have offices spread around the globe: Raleigh, Philadelphia, Montreal, Barcelona, Poznan, Lisbon, London. We also offer a WFH program (Working From Home).', session.message.text);
    })
    .matches('DevelopmentOpportunities', (session) => {
        session.send('Certainly! There are a lot of opportunities for personal and professional development.', session.message.text);
    })
    .matches('WorkHappy', (session) => {
        session.send('We are a people-oriented company, we really care about our employees, as we believe they are a key ingredient to our company success', session.message.text);
    })
    .matches('Positions', (session) => {
        session.send('We provide Level1 , Level2, Level3  LTE , QA Shared Services… medical, finance, it customer service ', session.message.text);
    })
    .matches('ServiceDesk', (session) => {
        session.send('Our service desk go well beyond basic help-desk support. In addition to providing multi-tiered end-user assistance: from proactive monitoring and maintenance to desk-side support dispatch., the service desk delivers a highly responsive IT management solution designed to empower your team to focus on more pressing, strategic goals. ', session.message.text);
    })
    .matches('LTE', (session) => {
        session.send('LTE stands for Lead Tech Expert, the scope of LTE\'s is to assist with high level escalations, serve as knowledge experts on projects (being pilots), assist with AI (chat bot) implementation.', session.message.text);
    })
    .matches('Turnover', (session) => {
        session.send('Our turnover rate is one of the lowest, as you can see from our employees’ feedback here: LINK. I\'ve been in the company myself for many years.', session.message.text);
    })
    .matches('Benefits', (session) => {
        session.send('We provide a wide range of benefits, such as: \n\n - Healthcare \n - Working from Home program \n - Paid bills (internet and electricity) \n - Courses of all kinds (java, python, adobe, Microsoft certified courses) \n - Extra work outdoor activities', session.message.text);
    })
    .matches('Employees', (session) => {
        session.send('Today, Alphanumeric employs more than 500 (and growing) full-time employees worldwide', session.message.text);
    })
    .matches('HowToApply', (session) => {
        session.send('If you\'re wishing to apply you can do so via the following website, upon registering and uploading your CV, you will be provided with a username and password and you will be able to enroll the assessment test. After that, a member of HR will be in contact with you to schedule an interview.', session.message.text);
    })
    .matches('Cancel', (session) => {
        session.send('Ok, bye! If you want to start the conversation again just say Hello :)', session.message.text);
        session.endDialog();
    })

    /*
    .matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
    */
    .onDefault((session) => {
        session.send('Sorry, I did not understand. Type \'help\' for a list of commands. ', session.message.text);
    });

    bot.dialog('/', intents);
}

module.exports.init = init;