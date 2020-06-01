/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
const admin = require("firebase-admin");
var firebaseConfig = {
  apiKey: "AIzaSyAC8nlDV_Md7DGS75ZpNjBCkjjHAqCxdWU",
  authDomain: "place-ukrcwm.firebaseapp.com",
  databaseURL: "https://place-ukrcwm.firebaseio.com",
  projectId: "place-ukrcwm",
  storageBucket: "place-ukrcwm.appspot.com",
  messagingSenderId: "934016800279",
  appId: "1:934016800279:web:b9e61fc9733531c5886e52"
};
admin.initializeApp(firebaseConfig);

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Text, Card, Image, Suggestion, Payload} = require('dialogflow-fulfillment');
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add('Hi, should i give you a place or do you want to choose from multiple options?');
    agent.add(new Suggestion('Random place'));
    agent.add(new Suggestion('Options'));
  }

  function getOptions(agent){
    agent.add('Here are your options to choose from: Temperature, noise, light-level and Occupants');
    agent.add(new Suggestion('Temperature'));
    agent.add(new Suggestion('noise'));
    agent.add(new Suggestion('light-level'));
    agent.add(new Suggestion('Occupants'));
  }

  function getRandomPlace(agent){
    let place  = "U-"
    place += Math.floor(Math.random() * 5) + 1;
    var ref = admin.database().ref('/place/' + place);
    return new Promise((resolve, reject) => {
      ref.once("value", (snapshot) => {
        getRoomInformation(snapshot);
        satisfiedWithPlace(agent)
        return resolve();
      }).catch(error =>{
        this.errorMessage = error.message;
      });
    });
 
  }

  function satisfiedWithPlace(agent){
    agent.add('Are you satisfied with the place?')
    agent.add(new Suggestion('Yes'));
    agent.add(new Suggestion('No'));
  }

  function getPlaceFromOption(agent){

    const parameter = agent.parameters.placeParameter;
    const levelOfOption = agent.parameters.levelOfOption;
    switch(parameter.valueOf()){
      case 'Temperature':
        getTemperatureOptions(agent);
        break;
      case 'Noise':
        getNoiseLevelOptions(agent);
        break;
      case 'lightlevel':
        getLightLevelOptions(agent);
        break;
      case 'Occupants':
        getOccupantsOptions(agent);
        break;
    }
  }
  
  function getPlaceFromLevelOfOption(placeParameter, levelOfOption){

  }


  function giveFeedback(agent){
    agent.getContext('feedback')
    agent.add('Would you like to provide some feedback for the place')
  }

  function fallback(agent) {
    agent.add('Woah! Its getting a little hot in here.');
    agent.add(`I didn't get that, can you try again?`);
  }

  function getTemperatureOptions(agent){
    agent.add(new Suggestion('Colder'));
    agent.add(new Suggestion('Same as usual'));
    agent.add(new Suggestion('Warmer'));
  }

  function getOccupantsOptions(agent){
    agent.add(new Suggestion('Fewer occupants'));
    agent.add(new Suggestion('Same amount'));
    agent.add(new Suggestion('Occupants does not matter'));
  }

  function getLightLevelOptions(agent){
    agent.add(new Suggestion('Darker'));
    agent.add(new Suggestion('Same light level'));
    agent.add(new Suggestion('Lighter'));
  }

  function getNoiseLevelOptions(agent){
    agent.add(new Suggestion('less noise'));
    agent.add(new Suggestion('Same noise level'));
    agent.add(new Suggestion('Noise does not matter'));
  }

  function getFinalPlace(agent){
    let place  = "U-"
    place += Math.floor(Math.random() * 5) + 1;
    var ref = admin.database().ref('/place/' + place);
    return new Promise((resolve, reject) => {
      ref.once("value", (snapshot) => {
        getRoomInformation(snapshot);
        satisfiedWithPlace(agent)
        return resolve();
      }).catch(error =>{
        this.errorMessage = error.message;
      });
    });
 
  }

  let intentMap = new Map(); // Map functions to Dialogflow intent names
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('get a place from option', getPlaceFromOption);
  intentMap.set('get random place', getRandomPlace);
  intentMap.set('get place options', getOptions);
  intentMap.set('get place from temperature options', getTemperatureOptions);
  intentMap.set('get place from occupants options', getOccupantsOptions);
  intentMap.set('get place from light level options', getLightLevelOptions);
  intentMap.set('get place from noise level options', getNoiseLevelOptions);
  intentMap.set('get final place', getFinalPlace);
  intentMap.set('give feedback', giveFeedback);
  agent.handleRequest(intentMap);


  //Logic here
  function placeToCard(place){
    
  }

  function getRoomInformation(place){

    let text ='Your room is: ' + place.val().name + ' \n\n';
    text += 'The temperature is: ' + place.val().temperature + ' \n\n';
    text += 'There is currently: ' + place.val().occupants + ' occupants in the room \n\n'
      //light
    if(place.val().lux > 300 && place.val().lux < 600)
      text += 'The lighting is a little bright \n\n'
    if(place.val().lux < 300 && place.val().lux > 200)
      text += 'The lighting is a average \n\n';
    if(place.val().lux < 200)
      text += 'The lighting is dark \n\n';
      //noise
    if(place.val().decibel > 50 && place.val().decibel < 60)   
      text += 'The noise level is silent \n\n'; 
    if(place.val().decibel >= 60 && place.val().decibel < 70)   
      text += 'The noise level is average \n\n'  
    if(place.val().decibel > 70 && place.val().decibel < 80)   
      text += 'The noise level lis a bit loud \n\n';
    agent.add(text);
  }


  //ALL DATABASE LOGIC IS HERE: 
  function getRandomPlaceFromDatabase(){
    let places
    //var place  = "u-"
    //place += Math.floor(Math.random() * 5) + 1;
    var ref = admin.database().ref('/place/U-1');

    ref.once("value", (snapshot) => {
      places = snapshot.val().name;
    }).catch(error =>{
      this.errorMessage = error.message;
    });
    return places;
  }

  function getPlaceFromDatabaseFromParameter(parameter){
    return admin.database().ref('/place/'+ parameter).toJSON;
  }

  function setCurrentPlaceIsTempBooked(bool, placeName){
    admin.database().ref('/place/' + placeName).update({
      "isTempBooked": bool
    });
  }

  function setCurrentPlaceIsBooked(bool, placeName){
    admin.database().ref('/place/' + placeName).update({
      "isBooked": bool
    });
  }
});


exports.updateDatabase = functions.https.onRequest((request, response) => {
    
});