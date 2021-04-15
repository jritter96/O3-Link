const express = require('express');
const app = express();
const http = require('http').Server(app);
const mongoose = require('mongoose');
const path = require('path');
const config = require('config');

//MQTT
const mqtt = require('mqtt');
const Hub = require('./models/Hub');

//HUB information
const HUB_MQTT_T_1 = {
  id: 1,
  ip:'mqtt://207.216.103.199',
  port:1883
};
const HUB_MQTT_T_2 = {
  id: 2,
  ip:'mqtt://207.216.103.199',
  port:1884
};
const HUB_MQTT_A = {
  id: 3,
  ip:'mqtt://172.103.236.78',
  port:1883
};

//Body parser middleware 
app.use(express.json());

//Attempt connecting to the hubs
const client_t_1 = mqtt.connect(HUB_MQTT_T_1.ip, {port:HUB_MQTT_T_1.port});
const client_t_2 = mqtt.connect(HUB_MQTT_T_2.ip, {port:HUB_MQTT_T_2.port});
const client_a = mqtt.connect(HUB_MQTT_A.ip, {port:HUB_MQTT_A.port});


//Connect to the database
const db = config.get('mongoURI');

mongoose
    .connect(db,{useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false})
    .then(()=>console.log('Readings database connected...'))
    .catch(err=>console.log(err));

//User the following routes for endpoints
app.use('/api/readings',require('./routes/api/readings'));
app.use('/api/hub_info',require('./routes/api/hub_info'));
app.use('/api/restricted_hubs',require('./routes/api/secure_hub'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

//MQTT Topic List
const topic_list=[
  "events/object/irTemperature",
  "events/object/soundLevel",
  "events/object/lightLevel",
  "events/object/occupantHumidity"
  //"events/object/acousticActivityLevel"
];

//Listen to the following MQTT events

//MQTT Client Subscribe T 1
client_t_1.on('connect', () => {
    //Once the client is connected, subscribe to the topic list
    client_t_1.subscribe(topic_list);
    console.log("Subscribed to Hub T1");
})
  
client_t_1.on('message', (topic, message) => {
  
  //Determines which object field is to be updated
  var updateField = topic.slice(14);
  
  //Find the hub in the database and extract old values 
  Hub.findOne({hub_id: HUB_MQTT_T_1.id})
    .then(hub=>
    {
      //saving old values to ensure other readings arent overwritten
      var newReading = {
        irTemperature: hub.readings.irTemperature,
        soundLevel: hub.readings.soundLevel,
        lightLevel: hub.readings.lightLevel,
        occupantHumidity: hub.readings.occupantHumidity
      };

      //Updating the desired field using topic specifier from updateField
      newReading[updateField] = JSON.parse(message.toString());

      //Save the updated readings into the database
      Hub.updateOne({hub_id: HUB_MQTT_T_1.id}, {readings: newReading})
        .then(res =>console.log(topic+" field was updated"))
        .catch(err=>console.log(err));
    });
})

client_t_2.on('connect', () => {
  client_t_2.subscribe(topic_list)
  console.log("Subscribed to Hub T2");
})

client_t_2.on('message', (topic, message) => {

  //Determines which object field is to be updated
  var updateField = topic.slice(14);

  //Find the hub in the database and extract old values 

  Hub.findOne({hub_id: HUB_MQTT_T_2.id})
    .then(hub=>{

      //saving old values to ensure other readings arent overwritten
      var newReading = {
        irTemperature: hub.readings.irTemperature,
        soundLevel: hub.readings.soundLevel,
        lightLevel: hub.readings.lightLevel,
        occupantHumidity: hub.readings.occupantHumidity
      };

      //Updating the desired field
      newReading[updateField] = JSON.parse(message.toString());

      //Save the updated readings into the database
      Hub.updateOne({hub_id: HUB_MQTT_T_2.id}, {readings: newReading})
      .then(res =>console.log(topic+" field was updated"))
      .catch(err=>console.log(err));
    });

})


client_a.on('connect', () => {
  client_a.subscribe(topic_list)
  console.log("Subscribed to Hub A");
})

client_a.on('message', (topic, message) => {

  //Determines which object field is to be updated
  var updateField = topic.slice(14);
  
  //Find the hub in the database and extract old values 

  Hub.findOne({hub_id: HUB_MQTT_A.id})
    .then(hub=>{

      //saving old values to ensure other readings arent overwritten
      var newReading = {
        irTemperature: hub.readings.irTemperature,
        soundLevel: hub.readings.soundLevel,
        lightLevel: hub.readings.lightLevel,
        occupantHumidity: hub.readings.occupantHumidity
      };

      //Updating the desired field
      newReading[updateField] = JSON.parse(message.toString());

      //Save the updated readings into the database
      Hub.updateOne({hub_id: HUB_MQTT_A.id}, {readings: newReading})
      .then(res =>console.log(topic+" field was updated"))
      .catch(err=>console.log(err));
    });
});

if(process.env.NODE_ENV==='production'){
    app.use(express.static('client/build'));

    app.get('*', (req,res)=>{
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const port = process.env.PORT||5000;

http.listen(port, ()=>{
    console.log('listening on port: ' + port);
});