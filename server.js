const express = require('express');

const app = express();
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.urlencoded({extended:true}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/about', (req,res) => {
    res.sendFile(__dirname + '/views/about.html');
})

app.get('/contact', (req,res) => {
    res.sendFile(__dirname + '/views/contact.html')
})

app.post('/contact', (req, res) => {
    console.log(req.body);
    res.send(`<h2>Thanks, ${req.body.name}! Your message has been received.</h2>`);
});

app.use((req,res) => {
    res.status(404).sendFile(__dirname + '/views/not_found.html')
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'));