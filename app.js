let express = require('express');
let app = express();

app.get('/',(req,res)=>{
    res.send("This will be home page");
})

app.listen(3000,()=>{
    console.log('server started at port 3000');
})