const error = (message, code)=>{
    console.log(message);
    let err = new   Error(message);
    err.code = code;
    return err;
}

const errorResponse = (response, error)=>{
    console.log(error);
    let code = 500;
    let message = 'Internal Server Error';
    if(error.code && typeof error.code === Number){
        code = error.code;
    }
    if(error.message){
        message = error.message;
    }
    response.status(code).json({
        success: false,
        message: message
    });
}

exports.customError = error;
exports.errorResponse = errorResponse;