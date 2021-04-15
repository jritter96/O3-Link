const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Hub = require('../../models/Hub');

//For       GET api/readings
//desc      GET all readings
//Access    Public
router.get('/', (req,res)=>{
    Hub.find()
        .sort({date: -1})
        .limit(10)
        .then(hubs=>res.json(hubs));
    console.log("received get req for readings");
});

//for       Get api/readings/ID
//desc      Returns information for a specific hub
//access    public
router.get('/:id', (req,res)=>{
    Hub.findOne({hub_id:req.params.id})
        .then(hub=>res.json(hub))
        .catch(err=>res.status(404).json({success: false}));
});

module.exports = router;