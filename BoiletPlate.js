/*
Invocation name initiates interaction with skill
"start ___" , 
"tell ___"

BUILT IN INTENTS:
cancel,stop,help,fallback,..

*/


/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const http = require(`http`);

//checks if getnewfact intent was given
const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  //Previous code that would run if getnewfact intent
   // handle(handlerInput) {
  //   const factArr = data;
  //   const factIndex = Math.floor(Math.random() * factArr.length);
  //   const randomFact = factArr[factIndex];
  //   const speechOutput = GET_FACT_MESSAGE + randomFact;

  //   return handlerInput.responseBuilder
  //     .speak(speechOutput)
  //     .withSimpleCard(SKILL_NAME, randomFact)
  //     .getResponse();
  // },
  //if getnewfact intent do this
  handle(handlerInput) {
    let options = {
      host: `numbersapi.com`,
      port: 80,
      path: `/random/trivia`,
      method: `GET`,
    };
    async function buildAlexaResponse(options){
      let responseFromAPI = await httpRequestPromise(options);
      return handlerInput.responseBuilder
      .speak(GET_FACT_MESSAGE+responseFromAPI)
      .getResponse();
    }
    return buildAlexaResponse(options);
  }
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

//ALEXA fact name to start fact skill
const SKILL_NAME = 'Silly Number Facts';
//constant alexa string value that you can appent to your return
const GET_FACT_MESSAGE = 'Here\'s your random year fact!: ';
//usage statement
const HELP_MESSAGE = 'You can say tell find random year info year history fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

//Commented out cause not used.
// const data = [
//   'A year on Mercury is just 88 days long.',
//   'Despite being farther from the Sun, Venus experiences higher temperatures than Mercury.',
//   'Venus rotates counter-clockwise, possibly because of a collision in the past with an asteroid.',
//   'On Mars, the Sun appears about half the size as it does on Earth.',
//   'Earth is the only planet not named after a god.',
//   'Jupiter has the shortest day of all the planets.',
//   'The Milky Way galaxy will collide with the Andromeda Galaxy in about 5 billion years.',
//   'The Sun contains 99.86% of the mass in the Solar System.',
//   'The Sun is an almost perfect sphere.',
//   'A total solar eclipse can happen once every 1 to 2 years. This makes them a rare event.',
//   'Saturn radiates two and a half times more energy into space than it receives from the sun.',
//   'The temperature inside the Sun can reach 15 million degrees Celsius.',
//   'The Moon is moving approximately 3.8 cm away from our planet every year.',
// ];

async function httpRequestPromise(options) {
  //log the options in case we need to debug
  console.log(`~~~~~~~~~~~~~~~${JSON.stringify(options)}~~~~~~~~~~~~~`);
  // return new pending promise
  return new Promise((resolve, reject) => {
    const request = http.request(options, (response) => {
      // reject the promise if the HTTP status isn't `Successful 2xx`
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed to load page, status code: ' + response.statusCode));
      }
      // crete an array for holding data temporarily
      const body = [];
      // every time we get data, grab the chunk and push it to the array
      response.on('data', (chunk) => body.push(chunk));
      // when we are done, resolve the promise with all the chunks joined
      response.on('end', () => resolve(body.join('')));
    });
    // reject the promise if there are connection errors of the request
    request.on('error', (err) => reject(err));
    request.end();
  });
}

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
