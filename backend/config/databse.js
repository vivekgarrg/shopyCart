const mongoose = require('mongoose')

const connectDatabase = ()=>{

    mongoose.connect(process.env.DB_LOCAL_URI,{
        useNewUrlParser:  true
    }).then(con =>{
        console.log(`mongoDb connected with host : ${con.connection.host}`)
    })
}

module.exports =  connectDatabase