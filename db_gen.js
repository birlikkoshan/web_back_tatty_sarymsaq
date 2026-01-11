const path = require("path");
const fs = require("fs");
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database('database.db')

function readItems(callback) {
  const itemsPath = path.join(__dirname, "items.json");
  fs.readFile(itemsPath, "utf8", (err, data) => {
    if (err) {
      callback(err, null);
      return;
    }
    try {
      const items = JSON.parse(data);
      callback(null, items);
    } catch (e) {
      callback(e, null);
    }
  });
}

function insertCourse(err,items) {
    if (err){
        console.log(err)
    } else {
        items.forEach(element => {
            db.run(`INSERT INTO Courses(title,code,credits,description,capacity,enrolled,prerequisites) VALUES(?,?,?,?,?,?,?)`,
                [element.title,element.code,Number(element.credits),element.description,element.capacity,element.enrolled,element.prerequisite],
            (err) => {
                if (err) {console.log(err)}
            })
        });
    }
}

db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS Courses(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        code TEXT NOT NULL,
        credits INTEGER,
        description TEXT,
        instructor_id INTEGER,
        capacity INTEGER,
        enrolled INTEGER,
        prerequisites TEXT)`)
    readItems(insertCourse)
})





