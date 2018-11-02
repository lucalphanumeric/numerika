const express = require('express');
const builder = require('botbuilder');
const nodemailer = require('nodemailer');
const isEmail = require('isemail');
const timeout = require("botbuilder-timeout"); //https://github.com/User1m/botbuilder-timeout

const app = express();

//Bot name and user name
let botName = "Numerika";
let userName = "User";

var inMemoryStorage = new builder.MemoryBotStorage();

function init(app){
    /*
    |--------------------------------------------------------------------------
    |   Bot credential from Microsoft
    |--------------------------------------------------------------------------
    */
    const connector = new builder.ChatConnector({
        appId: 'fc9838f3-2821-405e-8df1-7bea97c25446', //should be env.BOT_APP_ID,
        appPassword: 'saKQ44)%plpqhHJQXB483:;', //should be env.BOT_APP_PASSWORD,
    });

    // Endpoint to connect | Listen to messages from the users
    app.post('/api/help', connector.listen());

    //Option for the timeout function
    const timeoutOptions = {
        PROMPT_IF_USER_IS_ACTIVE_MSG: "Hey, are you still there?",
        PROMPT_IF_USER_IS_ACTIVE_BUTTON_TEXT: "Yes!",
        PROMPT_IF_USER_IS_ACTIVE_TIMEOUT_IN_MS: 90000,
        END_CONVERSATION_MSG: "Conversation ended. If you need further help just type 'Hello' or 'Help' for a list of commands.",
        END_CONVERSATION_TIMEOUT_IN_MS: 30000
    };

    // Create bot with a function to receive messages from the user
    var bot = new builder.UniversalBot(connector, function(session){
        session.send('Hello user!', session.message.text);
    }).set('storage', inMemoryStorage);
    

    // Make sure we add code to validate these fields
    var luisAppId = process.env.LuisAppId || 'b53dde3a-15fd-45dc-994d-335575f40ce2';
    var luisAPIKey = process.env.LuisAPIKey || 'bd9819c60a8b42fda1fad4d27cf0d2bf';
    var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

    // Check if Bing autospell needs to be added here
    const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;
  

    //Store conversation
    let chatHistory = [];
    /////session.userData.chatHistory = [];

    // Send welcome when conversation with bot is started, by initiating the root dialog
    bot.on('conversationUpdate', function (session, args, next) {
        if (session.membersAdded) {
            session.membersAdded.forEach(function (identity) {
                if (identity.id === session.address.bot.id) {
                    bot.beginDialog(session.address, 'InitialGreeting');
                }
            });
        }
    });
    
    // Sets talked to 1 when the user first sends a message
    // and sets the time passed since the last message to zero. TODO
    bot.on('incoming', function(session){
        //timeout.setConversationTimeout(bot, options);
    });

    //Code to initiate the timeout function
    //Will need a better look into this to see a better way to activate
    timeout.setConversationTimeout(bot, timeoutOptions);

    // Main dialog with LUIS
    var recognizer = new builder.LuisRecognizer(LuisModelUrl);
    bot.recognizer(recognizer);

    var dialogg = new builder.IntentDialog({ recognizers: [recognizer] });
    
    bot.dialog('InitialGreeting',
        function(session, args){
            let greetingText = "Hello! My name is Numerika and I\'m here to help you understand more about our company Alphanumeric Systems! How may I help you?";
            session.send(greetingText, session.message.text);
            let chatHistory = session.privateConversationData.chatHistory = [];
            session.privateConversationData.msg = "";
            addToHistory(session, botName, greetingText);
            session.privateConversationData.talked = 0;
            session.privateConversationData.timePassed = 0;
            session.endDialog();
        }
    );

    bot.dialog('Inactive',
        function(session, args){
            let inactiveText = 'Hello, I\'m still here for you if you need something :)';
            session.send(inactiveText, session.message.text);
            addToHistory(session, botName, inactiveText);
            session.endDialog();
        }
    );

    bot.dialog('Greeting', 
        function(session, args){
            let greetingText2 = 'Hello :)';
            session.send(greetingText2, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, greetingText2); 
            session.endDialog();
        }
    ).triggerAction({
        matches: 'Greeting',
    });

    //Dialogs
    bot.dialog('Help', 
        function(session, args){
            session.conversationData.test = 1;
            let helpText = session.conversationData.test+'You can ask anything that you want to know about Alphanumeric Systems! \n You can ask me about: \n - The history of the company \n - Our values \n - Location of the offices \n - Development Opportunities \n - Employee hapiness \n - Available positions \n - Service Desk \n - What is LTE \n - Turnover rate \n - Benefits available \n - Number of employees \n\n  \n\n You can let me know if you would like to talk to a real person.';
            session.send(helpText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, helpText);
            session.endDialog();
        }
        
    ).triggerAction({
        matches: 'Help',
    });

    bot.dialog('History', 
        function(session, args){
            let historyText = 'Alphanumeric Systems has been around since 1979 providing worldwide, multi-language IT support, covering different lines of business such as Salesforce, Vaccines, Finance, facilities and many more';
            session.send(historyText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, historyText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'History',
        onInterrupted: function (session) {
            session.send('Interrupted'); // Not possible to be interrupted, but it's nice as a reference
        }
    });

    bot.dialog('LTE',
        function(session, args){
            let lteText = 'LTE stands for Lead Tech Expert, the scope of LTE\'s is to assist with high level escalations, serve as knowledge experts on projects (being pilots), assist with AI (chat bot) implementation';
            session.send(lteText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, lteText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'LTE',
    });

    bot.dialog('HowToApply',
        function(session, args){
            let howapplyText = 'If you\'re wishing to apply you can do so via the following website, upon registering and uploading your CV, you will be provided with a username and password and you will be able to enroll the assessment test. After that, a member of HR will be in contact with you to schedule an interview';
            session.send(howapplyText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, howapplyText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'HowToApply',
    });

    bot.dialog('Values',
        function(session, args){
            let valuesText = 'We believe that people are the most important ingredient of our company, creating an environment based on trust, fairness, transparency and respect';
            session.send(valuesText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, valuesText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'Values',
    });

    bot.dialog('ServiceDesk',
        function(session, args){
            let servicedeskText = 'Our service desk go well beyond basic help-desk support. In addition to providing multi-tiered end-user assistance: from proactive monitoring and maintenance to desk-side support dispatch., the service desk delivers a highly responsive IT management solution designed to empower your team to focus on more pressing, strategic goals';
            session.send(servicedeskText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, servicedeskText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'ServiceDesk',
    });

    bot.dialog('Offices',
        function(session, args){
            let officesText = 'We have offices spread around the globe: Raleigh, Philadelphia, Montreal, Barcelona, Poznan, Lisbon, London. We also offer a WFH program (Working From Home)';
            session.send(officesText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, officesText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'Offices',
    });

    bot.dialog('Benefits',
        function(session, args){
            let benefitsText = 'We provide a wide range of benefits, such as: \n\n - Healthcare \n - Working from Home program \n - Paid bills (internet and electricity) \n - Courses of all kinds (java, python, adobe, Microsoft certified courses) \n - Extra work outdoor activities';
            session.send(benefitsText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, benefitsText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'Benefits',
    });

    bot.dialog('DevelopmentOpportunities',
        function(session, args){
            let developmentOpportunitiesText = 'Certainly! There are a lot of opportunities for personal and professional development';
            session.send(developmentOpportunitiesText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, developmentOpportunitiesText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'DevelopmentOpportunities',
    });

    bot.dialog('Employees',
        function(session, args){
            let employeesText = 'Today, Alphanumeric employs more than 500 (and growing) full-time employees worldwide';
            session.send(employeesText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, employeesText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'Employees',
    });

    bot.dialog('WorkHappy',
        function(session, args){
            let employeesText = 'We are a people-oriented company, we really care about our employees, as we believe they are a key ingredient to our company success';
            session.send(workHappyText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, workHappyText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'WorkHappy',
    });

    bot.dialog('Positions',
        function(session, args){
            let employeesText = 'We have several open positions at this time!';
            session.send(positionsText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, positionsText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'Positions',
    });

    bot.dialog('Turnover',
        function(session, args){
            let employeesText = 'Our turnover rate is one of the lowest, as you can see from our employees’ feedback here: LINK. I\'ve been in the company myself for many years.';
            session.send(turnoverText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, turnoverText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'Turnover',
    });

    bot.dialog('Randy', 
        function(session, args){
            let randyText = 'Randy is the CEO. He leads Alphanumeric with a straightforward directive: Have a game plan. Set clear expectations. Empower your people. Always over-deliver.';
            session.send(randyText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, randyText);   
            session.endDialog();
        }
        
    ).triggerAction({
        matches: 'Randy',
    });

    bot.dialog('Jay', 
        function(session, args){
            let jayText = 'Jay is the Senior Vice President of Global Operations, CIO. He is responsible for Alphanumeric’s growth in the public sector space as well as managing future operations with partners in either a prime or subcontractor role.';
            session.send(jayText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, jayText);   
            session.endDialog();
        }
        
    ).triggerAction({
        matches: 'Jay',
    });

    bot.dialog('Analyst', [
        function(session, args, next){
            let analystText = 'We will transfer this chat to an analyst.';
            let analystText2 = 'Type your email address:';
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, analystText);
            addToHistory(session, botName, analystText2);
            
            session.send(analystText, session.message.text);
            builder.Prompts.text(session, analystText2);
        },
        function(session, results){
            let email = results.response; // TODO: Transformar em variaveis privateConversationData ou userdata
            let validEmail = isEmail.validate(email); // Same

            addToHistory(session, 'USER EMAIL ', email);

            if(validEmail){
                let send = emailLog(session);
                if(send != false){
                    session.send('Thank you. You will be contacted soon!', session.message.text);
                }else{
                    session.send('There was an error sending an email to the analyst. Please try again.');
                }
            }else{
                session.send('Email not valid', session.message.text);
                session.endDialog();
            }
            
            session.endDialog();
        }
    ]).triggerAction({
        matches: 'Analyst',
    }).cancelAction('cancelList', 'Ok, we will not transfer this conversation. How may I help you?', { matches: /\bcancel\b/i }); //TODO: Add a way to cancel the prompt


    //Dialog for when the bot doesn't understand what the user asked
    bot.dialog('None',
        function(session, args){
            let noneText = 'I\'m sorry, I don\'t understand what you just said.';
            session.send(noneText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, noneText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'None',
    });

    bot.dialog('',
        function(session, args){
            let noneText = 'I\'m sorry, I don\'t understand what you just said.';
            session.send(noneText, session.message.text);
            addToHistory(session, userName, session.message.text);
            addToHistory(session, botName, noneText);   
            session.endDialog();
        }
    ).triggerAction({
        matches: 'None',
    });
    
    //Function no longer needed. To delete later
    function inactivityCheck(session) {
        // Rate at which the funtion reloads and verifies
        // the time since the last user sent message.
        // Currently every second.
        let sesh = session;
        let updateRate = 1;
        let talked = "talked";
        let count = "count";

        // Inactivity Logic
        // If it's the first time 
        if(!sesh.conversationData.talked){
            sesh.conversationData.talked = 1;
        }
        
        // If the user has sent at least one message to the bot
        if(sesh.conversationData.talked){
            
            if(!sesh.conversationData.count){
                sesh.conversationData.count = 0;
            }else{
                sesh.conversationData.count++;
            }

            console.log(sesh.conversationData.count);

        }
        setTimeout(inactivityCheck, updateRate * 1000); // times 1000 to make a second
    }

    // Fix
    function addToHistory(session, user, message){
        //let msg = "\n\n\n" + user + ": " + message + "\n";
        //chatHistory.push(msg);
        session.privateConversationData.msg = "\n\n\n" + user + ": " + message + "\n";
        if(!session.userData.chatHistory){
            session.userData.chatHistory = [];
        }
        session.userData.chatHistory.push(session.privateConversationData.msg);
        console.log(session.userData.chatHistory);
    }

    //Send the email to the analyst
    function emailLog(session){
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'n342rxvwf76ind2k@ethereal.email', // generated ethereal user
                    pass: 'Z2sJGqTuhWsV1pR6Fs' // generated ethereal password
                }
            });

            // setup email data with unicode symbols
            let mailOptions = {
                from: '"Numerika" <numerika@alphanumeric.com>', // sender address
                to: 'analyst1@example.com, analyst2@example.com', // list of receivers
                subject: 'Assesment Site - Visitor Chat Request', // Subject line
                text: session.userData.chatHistory.toString() //Can also add html
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return false;
                }
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            });
        });
    }

}



module.exports.init = init;