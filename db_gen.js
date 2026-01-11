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
    db.run(`CREATE TABLE IF NOT EXISTS Instructors(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT)`)
    db.run(`INSERT INTO Instructors(name,email) VALUES(?,?)`,["Birlik Koshan","birlik@university.edu"])
    db.run(`INSERT INTO Instructors(name,email) VALUES(?,?)`,["Artur Jaxygaliyev","artur@university.edu"])
    db.run(`INSERT INTO Instructors(name,email) VALUES(?,?)`,["Alikhan Nurzhan","alikhan@university.edu"])
    db.run(`INSERT INTO Instructors(name,email) VALUES(?,?)`,["Nursultan Beisenbek","nursultan@university.edu"])
    
    db.run(`CREATE TABLE IF NOT EXISTS Students(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        password TEXT)`
    )
    db.run(`INSERT INTO Students(name,email,password) VALUES(?,?,?)`,["Aiqyn","aiqyn@university.edu","12345678"])
    db.run(`INSERT INTO Students(name,email,password) VALUES(?,?,?)`,["Berdibek","berdibek@university.edu","qwerty"])
    db.run(`INSERT INTO Students(name,email,password) VALUES(?,?,?)`,["Alih","alih@university.edu","password"])
    db.run(`INSERT INTO Students(name,email,password) VALUES(?,?,?)`,["Damir","damir@university.edu","letmein"])

    db.run(`CREATE TABLE IF NOT EXISTS Courses(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        code TEXT NOT NULL,
        credits INTEGER,
        description TEXT,
        instructor TEXT,
        schedule TEXT,        
        room TEXT,
        capacity INTEGER,
        enrolled INTEGER,
        prerequisites TEXT)`)
    readItems(insertCourse)
})

// db.serialize(()=>{
//     db.run(`UPDATE Courses SET instructor_id = 1 WHERE id = 1`)
//     db.run(`UPDATE Courses SET instructor_id = 2 WHERE id = 2`)
//     db.run(`UPDATE Courses SET instructor_id = 3 WHERE id = 3`)
//     db.run(`UPDATE Courses SET instructor_id = 4 WHERE id = 4`)
//     db.run(`UPDATE Courses SET instructor_id = 1 WHERE id = 5`)
// })



module.exports = db;