const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

const User = require('../../models/User');

//For       Post api/auth
//Desc      Login user
//Access    Public

router.post('/', (req, res)=>{
    const {username, password} = req.body;
    
    //Simple validation, to be checked and modified later
    if(!username||!password){
        return res.status(400).json({msg: 'please enter all fields'});
    }

    //Finds and check user credentials and returns a token for a session
    User.findOne({username})
        .then(user=>{
            if(!user)return res.status(400).json({msg:"User does not exist."});

            //Validating password
            //Add sanitization
            bcrypt.compare(password, user.password)
                .then(isMatch=>{
                    if(!isMatch)return res.status(400).json({msg:"Incorrect username or password"});

                    jwt.sign(
                        {id: user.id},         
                        config.get('jwtSecret'),
                        {expiresIn: 3600},
                        (err, token)=>{
                            if(err) throw err;
                            res.json({
                                token,
                                user:{
                                    id: user.id,
                                    name: user.name,
                                    username: user.username,
                                    key: user._id
                                }
                            });
                        }
                    );
                });
        });
});


//For       GET api/auth/user
//Desc      retreive user data
//Access    private
router.get('/user', auth, (req,res)=>{
    console.log('get request happened');
});

module.exports = router;