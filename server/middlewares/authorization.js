const { errorResponse, customError } = require("../utils/errorHandler")


const adminAccess = (req, res, next)=>{
    try{
        const user = req.user;


        if(user.role !== 'admin'){
            throw customError('Unauthorised Access', 403);
        }

        next();
    }catch(err){
        errorResponse(res, err);
    }
}

const directorAccess = (req, res, next)=>{
    try{
        const user = req.user;


        if(user.role !== 'director' && user.role !== 'admin'){
            throw customError('Unauthorised Access', 403);
        }

        next();
    }catch(err){
        errorResponse(res, err);
    }
}

const inventoryAccess = (req, res, next)=>{
    try{
        const user = req.user;


        if(user.role !== 'inventory_associate' && user.role !== 'admin' && user.role !== 'director'){
            throw customError('Unauthorised Access', 403);
        }

        next();
    }catch(err){
        errorResponse(res, err);
    }
}

const agentAccess = (req, res, next)=>{
    try{
        const user = req.user;


        if(user.role !== 'agent' && user.role !== 'admin' && user.role !== 'director'){
            throw customError('Unauthorised Access', 403);
        }

        next();
    }catch(err){
        errorResponse(res, err);
    }
}

const accountantAccess = (req, res, next)=>{
    try{
        const user = req.user;


        if(user.role !== 'accountant'  && user.role !== 'admin' && user.role !== 'director'){
            throw customError('Unauthorised Access', 403);
        }

        next();
    }catch(err){
        errorResponse(res, err);
    }
}

module.exports = {
    adminAccess,
    directorAccess,
    inventoryAccess,
    agentAccess,
    accountantAccess
}