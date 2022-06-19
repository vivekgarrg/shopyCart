const app = require('./app')
const connectDatabase = require('./config/databse')

const dotenv = require('dotenv')

process.on('uncaughtException', err => {
    console.log(`uncaughtException occured: ${err.message}`)
    console.log(`Shutting dwon server due to uncaughtException`)
    process.exit(1)
})

//Setting up the dotenv file
dotenv.config( { path:'backend/config/config.env' })

connectDatabase()

const server = app.listen(process.env.PORT, ()=>{
    console.log(`server started on PORT : ${process.env.PORT} in ${process.env.NODE_ENV }`)
})

process.on('unhandledRejection', err=>{
    console.log(`Eror: ${err.message}`);
    console.log('`Shutting dwon the server due to Unhandled Rejection');
    server.close(()=>{process.exit(1)})
})