config = require('../config.json')
// Database = require('./Database')

const main = async (a, b)=>{
   return a+b;
}


main().then((result)=>{
    console.log(result)
})
.catch((e)=>{
    console.log(e, 'i am here')
})