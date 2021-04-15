const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Hub_info = require('../../models/SecureHub');

//For       POST api/restricted_hubs
//desc      POST all restrictedd hubs position
//Access    Public
router.post('/', auth, (req,res)=>{
    const {key} = req.body;

    Hub_info.find()
        .sort({hub_id: 1})
        .then(hubs=>{
            var filtered_array = [];
            hubs.forEach(hub=>{
                if(hub.whitelist.indexOf(key)!==-1){
                    filtered_array.push(
                        {
                            hub_id: hub.hub_id,
                            location: hub.location,
                            readings: hub.readings,
                            measured_power: hub.measured_power,
                            mac: hub.mac
                        }
                        
                    )
                    console.log(hub);
                    // console.log(hub.whitelist);
                    // console.log(hub.location);
                    // console.log(hub.readings);
                }
            });
            if(!filtered_array.length){
                res.json("User has no additional access...");
                return
            }
            res.json(filtered_array);
        });
    console.log("Received secured hubs location get request...");
});

//@route    POST api/restricted_hubs
//@desc     Declare/Update a restricted hub
// @access  public
router.post('/', (req,res)=>{
    const {hub_id, location, whitelist, pass, measured_power, mac} = req.body;

    if(pass!=="prot_hub_pass") {
        res.status(401).json("Not authorized");
        return
    }
    if(!hub_id||!location||!whitelist||mac||measured_power) {
        res.status(400).json("Verify if hub_id, power, mac, and location are entered correctly");
        return
    }

   SecureHub.findOneAndUpdate({hub_id},{hub_id, location, whitelist, measured_power, mac},{upsert:true})
        .then(securehub =>res.json({hub_id, location, whitelist, measured_power, mac, msg: "Update successful"}));
});

module.exports = router;