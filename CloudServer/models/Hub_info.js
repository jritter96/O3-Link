const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Hub_infoSchema = new Schema ({
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
    measured_power:{
        type: Number
    },
    mac:{
        type: String
    }

});

module.exports = Hubinfo = mongoose.model('hub_info', Hub_infoSchema);