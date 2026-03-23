const error = (message, code) => {
    let err = new Error(message);
    err.code = code;
    return err;
}

const errorResponse = (response, error) => {
    console.log(error)
    let code = 500;
    let message = 'Internal Server Error';
    if (error.code && typeof error.code === 'number') {
        code = error.code;
    }
    if (error.message) {
        message = error.message;
    }
    response.status(code).json({
        success: false,
        message: message
    });
}

const toObjectId = (id) => {
    if (!id) return null;
    try {
        return new mongoose.Types.ObjectId(id);
    } catch (err) {
        return null;
    }
};

exports.customError = error;
exports.errorResponse = errorResponse;
exports.toObjectId = toObjectId;