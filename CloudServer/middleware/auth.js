const config = require('config');
const jwt = require('jsonwebtoken');

function auth(req,res,next){
    const token = req.header('x-auth-token');

    //checking the token
    if(!token) return res.status(401).json({msg: 'No token - Authorization denied'});
    try{
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        //Add the user from payload
        req.user = decoded;
        next();
    }catch (e){
        res.status(400).json({msg: 'Token is not valid'});
    }
}

module.exports = auth;