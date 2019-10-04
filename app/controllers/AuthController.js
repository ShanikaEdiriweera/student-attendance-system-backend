import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User from '../models/user.model';
import authConfig from '../../config/auth.config';
import winston from '../../config/winston';

module.exports = {
    registerUser: (req, res) => {
        const masterKey = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
        if(!masterKey) return res.status(401).send({ message: "Master Key is required for registration." })
        if(masterKey !== authConfig.masterKey) return res.status(403).send({ message: "Invalid Master Key." })
        
        let req_JSON_user = req.body;
        // Validate request
        if( !req_JSON_user.username || 
            !req_JSON_user.password ||
            !req_JSON_user.name ||
            !req_JSON_user.contact ||
            !req_JSON_user.email ||
            !req_JSON_user.userType ) {
            
            return res.status(400).send({
                message: "Required User details can not be empty"
            });
        }

        const hashedPassword = bcrypt.hashSync(req_JSON_user.password, 10);

        // Create a User
        const user = new User({
            username: req_JSON_user.username,     
            password: hashedPassword,     
            name: req_JSON_user.name,  
            contact: req_JSON_user.contact,  
            email: req_JSON_user.email,  
            userType: req_JSON_user.userType
        });

        user.save()
        .then(data => {
            res.send({
                name : data.name,
                username : data.username,
                email : data.email,
                contact : data.contact,
                userType : data.userType
            });
        }).catch(err => {
            winston.error("error: ", err)
            res.status(500).send({
                message: err.message || "There was a problem registering the user."
            });
        });
    },

    authenticateToken : (req, res, next) => {
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
        if(!token) return res.status(403).send({ auth: false, message: 'No token provided.' });
        
        jwt.verify(token, authConfig.secret, function(err, decoded) {
            if (err) {
                winston.error("Authentication Error: ", err);
                return res.status(500).send({ 
                    auth: false, 
                    message: 'Failed to authenticate token.',
                    error: err
                });
            }
            // if everything good, save to request for use in other routes
            req.auth = { 
                username: decoded.data.username,
                isAdmin: decoded.data.isAdmin
            }
            winston.info("Authenticated user: ", req.auth);
            next();
        });
    },

    authenticateAdmin : (req, res, next) => {
        if(!req.auth.isAdmin){
            winston.warn('404 page requested')
            return res.end("NOT AN ADMIN")
        }
        next()
    },

    loginUser : async (req, res, next) => {
        const { username, password } = req.body;
        if( !username || !password ) return res.status(400).send({ message: "Username and Password Required." });
        
        const user = await User.findOne({ username });
        if(!user) return res.status(404).send({ message: "User not found." });
        const isCorrectPassword = bcrypt.compareSync(password, user.password);
        if(!isCorrectPassword) return res.status(401).send({ 
            auth: false, 
            token: null,
            message: 'Password incorrect.'
        });

        const jwtPayload = {
            name : user.name,
            username : user.username,
            email : user.email,
            contact : user.contact,
            isAdmin: user.userType === 'admin'
        };

        let jwtToken = jwt.sign({ data: jwtPayload }, authConfig.secret, { expiresIn: '2h' });

        res.json({ 
            message:'Login Success.',
            auth: true, 
            isAdmin: user.userType === 'admin',
            token: jwtToken
        });
    },
}