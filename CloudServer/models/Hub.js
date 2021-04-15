const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HubSchema = new Schema ({
    date:{
        type: Date,
        default: Date.now
    },
    readings: {
        type: Object,
        require: true
    },
    hub_id:{
        type: Number,
        require: true
    }

});

module.exports = Hub = mongoose.model('hub', HubSchema);