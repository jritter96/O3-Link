const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SecureHubSchema = new Schema ({
    date:{
        type: Date,
        default: Date.now
    },
    location: {
        type: Object,
        require: true
    },
    hub_id:{
        type: Number,
        require: true
    },
    whitelist:{
        type: Array,
        require: true
    },
    readings: {
        type: Object
    },
    measured_power:{
        type: Number
    },
    mac:{
        type: String
    }

});

module.exports = SecureHub = mongoose.model('securehub', SecureHubSchema);