const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

//For       POST api/users
//Desc      Registering a new user
//Access    Public
router.post('/', (req,res)=>{
    //body of the request should have the following: 
    const{name,username,password} = req.body;

    //Validation should be done here:
    if(!name||!username||!password){
        return res.status(400).json({msg: 'Please enter all of the fields...'});
    }

    User.findOne({username})
        .then(user=>{
            //If mongo returns non -1 value, that means there is a user with the indicated username
            if(user)return res.status(400).json({msg: 'User already exists in the database'});

            //model the new user
            const newUser = new User({name, username, password});

            //Create salt for password randomizaiton before hashing
            bcrypt.genSalt(10, (err,salt)=>{
                //Hash the password with the generated salt
                bcrypt.hash(newUser.password, salt, (err, hash)=>{
                    //new hashed password is now in hash
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user=>{
                            jwt.sign(
                                //arguments for the sign func
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
                                            username: user.username
                                        }
                                    });
                                }
                            );
                        });
                });
            });
        });
    console.log('New user has been registered...');
});

module.exports = router;