const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let bodyParser = require('body-parser');

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


app.post("/api/users", (req, res) => {
  try {

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
