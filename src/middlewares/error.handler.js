const errorHandler =(err , req ,res)=>{
    console.error(err.message)
    res.status(500).json({"error":err.message,"message":"ocurrio un error en el servidor"})
}

export default errorHandler