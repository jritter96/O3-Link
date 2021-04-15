const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReadingSchema = new Schema ({
    irTemperature: {
        type: Object,
        require: true
    },
    soundLevel:{
        type: Object,
        require: true
    },
    lightLevel:{
        type: Object,
        require: true
    },
    occupantHumidity:{
        type: Object,
        require: true
    }

});

module.exports = Reading = mongoose.model('reading', ReadingSchema);