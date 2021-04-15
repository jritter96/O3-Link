const express = require('express');
const Hub = require('../../models/Hub');
const router = express.Router();

const Hub_info = require('../../models/Hub_info');

//For       GET api/hub_info
//desc      GET all hubs position
//Access    Public
router.get('/', (req,res)=>{
    Hub_info.find()
        .sort({hub_id: 1})
        .limit(10)
        .then(hubs=>{
            console.log(hubs);
            res.json(hubs);
        }
            );
    console.log("Received hubs location get request...");
});

//@route    POST api/hub_info
//@desc     Declare/Update a hub
// @access  public
router.post('/', (req,res)=>{
    const {hub_id, location, measured_power, mac} = req.body;

    if(!hub_id||!location||!measured_power||mac) {
        res.status(400).json("Verify if hub_id, location, power and mac are entered correctly");
        return
    }

    Hub_info.findOneAndUpdate({hub_id},{hub_id, location, measured_power, mac},{upsert:true})
        .then(hub_info =>res.json({hub_id, location, measured_power, mac, msg: "Update successful"}));
});

module.exports = router;