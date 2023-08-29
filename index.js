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
  idUsername: {type: String},
  username: {type: String},
  date: {type: Date},
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

const findByid = async (data) => {
  try {
    let userFound = await User.findOne({_id:data})
    if (!userFound) {
      return false
    }
    return userFound
  } catch (err) {
    console.log("Error occured in findByid:", err)
  }
}

const findUsers = async (data) => {
  try {
    const filter = {}
    let usersFound = await User.find(filter);
    if (!usersFound) return false
    return usersFound
  } catch (err) {

  }
}

const findExercise = async (data) => {
  try {
    let {id, from, to, limit} = data
    const fromDateObj = from ? new Date(from) : null
    const toDateObj = to ? new Date(to) : null
    const limitSet = limit ? limit : 0
    let exercisesFound =  Exercise.find({idUsername: id})
    if (fromDateObj) exercisesFound = exercisesFound.find({date : {$gte : fromDateObj}})
    if (toDateObj) exercisesFound = exercisesFound.find({date : {$lte : toDateObj}})
    if (limitSet) exercisesFound = exercisesFound.limit(limitSet)
    return await exercisesFound
  } catch (err) {
    console.log("Error occured in findExercise:", err)
  }
}

const createExercise = async (data) => {
  try {
    const exerciseDocument = new Exercise(data);
    let saveExercise = await exerciseDocument.save();
    let foundExercise =await Exercise.findOne({_id: saveExercise._id}).select({idUsername: 0, __v:0})
    let formattedData = {
      "_id": foundExercise._id,
      "username": foundExercise.username,
      "date": foundExercise.date.toDateString(),
      "duration": Number(foundExercise.duration),
      "description": foundExercise.description
    }
    return formattedData
  } catch (err) {
    console.error("Error in createExercise:", err)
  }
}


const createUsername = async (data) => {
  try {
    let {username} = data;
    const usernameDocument = new User({
      username: username
    }); 
    let doc = await usernameDocument.save()
    return {
      "username": doc.username,
      "_id": doc._id
    }
  } catch (err) {
    console.error("Error in createUsername: ", err);
  }
}

app.get("/api/users", async (req, res) => {
  try {
    let users = await findUsers()
    return res.json(users)
  } catch (err) {
    console.error("Error in get /api/users:", err)
    return res.json({
      "error": "An error occured"
    })
  }
})


app.post("/api/users", async (req, res) => {
  try {
    let {username} = req.body
    let dataObj = {
      "username": username
    }
    let document = await createUsername(dataObj)  
    return res.json(document)
  } catch (err) {
    console.error("Error in post /api/users:", err)
    return res.json({
      "error": "An error occured"
    })
  }
})


app.post("/api/users/:id/exercises", async (req,res) => {
  try {
    let {id} = req.params
    let {description, duration, date} = req.body
    dateObj = new Date(date)
    let user = await findByid(id)

    if (user) {
      let dataObj = {
        "username": user.username,
        "idUsername": id,
        "description": description,
        "duration": duration,
        "date": dateObj
      }
      let documentCreated = await createExercise(dataObj)
      let formattedData = {
        "username": user.username,
        "description": description,
        "duration": Number(duration),
        "date" :dateObj.toDateString(),
        "_id" : user._id
      }
      return res.json(formattedData)
    }
  } catch (err) {
    console.error("Error in /api/exercise:", err)
    return res.json({
      "error": "An error occured"
    })
  } 
})


app.get('/api/users/:id/logs', async (req, res) => {
  try {
    let {id} = req.params
    let {from, to, limit} = req.query
    let formatedDateFrom = new Date(from)
    let formatedDateTo = new Date(to)
    let user = await findByid(id);
    let dataObj = {
      "id": id,
      "from": from,
      "to": to,
      "limit": limit
    }
    let formattedData = {};
    let arrayLogs = [];
    if (user) {
      let exercisesFound = await findExercise(dataObj)
      exercisesFound.forEach(element => {
        let dateObj = new Date(element.date)
        let formattedData = {
          "description": String(element.description),
          "duration": Number(element.duration),
          "date": dateObj.toDateString()
        }
        arrayLogs.push(formattedData)
      });

      formattedData = {
        "id": id,
        "username": user.username,
        "from": from ? formatedDateFrom.toDateString() : undefined,
        "to": to ? formatedDateTo.toDateString() : undefined,
        "count": exercisesFound.length,
        "log" : arrayLogs
      }

      res.json(formattedData)
    }

  } catch (err) {
    console.error("Error in /ap/users/id/logs", err)
    return res.json({
      "error": "An error occured"
    })
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
