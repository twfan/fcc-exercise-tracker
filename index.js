const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let bodyParser = require('body-parser');

//body-parser
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, required: true},
})



const exerciseSchema = new Schema({
  _id: {type: Number},
  username: {type: String, required: true},
  date: {type: String},
  duration: {type: Number},
  description: {type: String}
})

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const createUsername = async (data) => {
  try {
    let {username} = data;
    const usernameDocument = new User({
      username: username
    }); 
    return {
      "username": usernameDocument.username,
      "_id": usernameDocument._id
    }
  } catch (err) {
    console.error("Error in createUsername: ", err);
  }
}


app.post("/api/users", async (req, res) => {
  try {
    let {username} = req.body
    let dataObj = {
      "username": username
    }
    let document = await createUsername(dataObj)
    return res.json(document)
  } catch (err) {
    console.error("Error in /api/users:", err)
    return res.json({
      "error": "An error occured"
    })
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
