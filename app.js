const dotenv = require('dotenv');
const app = require('./index.js')
// import { mongoDBConnection } from "./DB/index.js";
dotenv.config();


app.listen(process.env.PORT||8000,()=>{
    console.log(`connecteddddddd to port ${process.env.PORT}`)
})