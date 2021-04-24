const express = require("express");
const app = express();
const multer = require('multer'); // extension To Upload files
const path = require('path');
const dotenv = require("dotenv"); // To Maintain Config files
dotenv.config();
const mongoose = require("mongoose"); // Extension to perform oprations on Mongo

app.use(express.static('files'))
const Task = require("./models/Task");
const upload = multer({dest:  '/public/uploads/'});
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
const helpers = require('./models/helpers');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null,'./public/uploads/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//Connection to  Mongo db
mongoose.set("useFindAndModify", false);
mongoose.connect(process.env.DB_CONNECT, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }, () => {
console.log("Connected to db!");
});

// setting up the view engine
app.set("view engine", "ejs");

// Default route
app.get('/',(req, res) => {
 Task.find({}, (err, parent) =>
 {
dats= doprocess(parent);
res.render("task.ejs", { Tasks: dats });
});
});

// To Edit the the list item
app
.route("/edit/:id")
.get((req, res) => {
const id = req.params.id;

Task.find({}, (err, tasks) => {
res.render("edit.ejs", { edneedTasks: tasks, idTask: id });
});
})
.post((req, res) => {
const id = req.params.id;
let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('cicon');

  upload(req, res, function(err) {
      // req.file contains information of uploaded file
      // req.body contains information of text fields, if there were any

      if (req.fileValidationError) {
          return res.send(req.fileValidationError);
      }
      else if (!req.file) {
          return res.send('Please select an image to upload');
      }
      else if (err instanceof multer.MulterError) {
          return res.send(err);
      }
      else if (err) {
          return res.send(err);
      }

      // Display uploaded image for user validation
     Task.findByIdAndUpdate(id, { content: req.body.content ,cicon:req.file.filename}, err => {
     if (err) return res.send(500, err);
     res.redirect("/");
     });
  });
});

// To Add the the list item
app
.route("/add/:id")
.get((req, res) => {
const id = req.params.id;
Task.find({}, (err, tasks) => {
res.render("add.ejs", { edneedTasks: tasks, idTask: id });
});
})
.post((req, res) => {

const toTask = new Task({
content: req.body.content,
parent:req.body.parent,
weight:req.body.weight*10
});
toTask.save();
const id = req.params.id;
Task.findByIdAndUpdate(id, {$inc:{chaild_count:1}}, err => {
if (err) return res.send(500, err);
});

res.redirect("/");
});

// get the list

app.get("/", (req, res) => {
Task.find({"parent":null}, (err, tasks) => {
  console.log(tasks);
res.render("list.ejs", { Tasks: tasks });
});
});

app.post('/',async (req, res) => {
const toTask = new Task({
content: req.body.content,
});
try {
await toTask.save();
res.redirect("/");
} catch (err) {
res.redirect("/goo");
console.log(err)
}
});

// To Remove the category from the list

app.route("/remove/:id").get((req, res) => {
const id = req.params.id;
Task.findByIdAndRemove(id, err => {
if (err) return res.send(500, err);
res.redirect("/");
});
});

// logic to group the notation
function doprocess(parent){
var  dataset_parent=[];
parent.forEach(function(element) {
if(element.parent == undefined){
dataset_parent.push(element);
chek= String(element._id);
parent.forEach(function(sublevel){
if(chek == sublevel.parent){
dataset_parent.push(sublevel);
if(sublevel.chaild_count > 0){
parent.forEach(function(subsublevel){
check1= String(sublevel._id);
if( check1 == subsublevel.parent){
dataset_parent.push(subsublevel);
parent.forEach(function(subsubsublevel){
check2= String(subsublevel._id);
if( check2 == subsubsublevel.parent){
dataset_parent.push(subsubsublevel);
}});  }  });  }  }  });  }  });
return dataset_parent;
}

app.listen(3000, () => console.log("Server Up and running"));
