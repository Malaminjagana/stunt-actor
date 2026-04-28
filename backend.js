const express = require(express);
const Database = require(Database);
const db = new Database('lj/db');
const app = exprees();
user.app(express.json());

// logic 

app.get('/route', (req,res) => {
    res.status(200).json({message: "ok "});
});

app.post('/route:id', (req,res) => {
const {field} = req.body;
res.status(201).json({});

});

app.put('/route:id', (req,res) => {
    const id =paresInt(req.params.id);
    res.status(200).json({put: " and delete is same way writen"});
});

app.delete('/route:lj', (req,res) => {
    const lj =paresInt(req.params.lj);
    res.status(200).json({putdeltet: " and delete is same way writen"});
});





















app.listen(3000, () => {
    console.log('this is the  server port');

});