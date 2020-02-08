class HttpError extends Error{
    constructor(message,error){
        super(message);
        this.code=error
    }
}
module.exports=HttpError