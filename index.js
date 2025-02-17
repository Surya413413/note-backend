
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt")
const {open} = require("sqlite");
const sqlite3 = require("sqlite3")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const app = express()
app.use(express.json())
app.use(cors())

const dbpath = path.join(__dirname, "note.db");

let db = null;

const initialization = async () => {
    try{
        db = await open({
            filename:dbpath,
            driver: sqlite3.Database
        })
        app.listen(3000, ()=> {
            console.log("server running on 3000 port")
        })

    }catch(e){
        console.log(`error occurs in db: ${e.message}`)
        process.exit(1)

    }

}
initialization()

//userRegister
app.post("/users/register/", async (request,response) => {
    const {name,email,password,} = request.body;
    const hashedPassword = await bcrypt.hash(password,10);
    const userQuery = `
    SELECT * FROM users WHERE name = '${name}';
    `;
    const dbUser = await db.get(userQuery);
    if (dbUser === undefined){
        //create user in userdetails
        const createQuery = `
        INSERT INTO users (name,email,password) VALUES ('${name}','${email}','${hashedPassword}');
        `;
        await db.run(createQuery)
        response.send("user created successfull")
    }else{

  // handle user error
    response.status(400)
    response.send("Email id already created")
    }
})

//login user 
app.post("/users/login/", async (request,response) => {
    const {email,password} = request.body;
    const userQuery = `
    SELECT * FROM users WHERE email = '${email}';
    `;
    const dbUser = await db.get(userQuery);
    if (dbUser === undefined){
        // user doesnt exit
        response.status(400)
        response.send("Invalid user login")
       
    }else{
  // campare password
  const isPasswordMatched = await bcrypt.compare(password,dbUser.password)
  if (isPasswordMatched === true){
    const playload = {id: dbUser.id};
    const jwtToken = jwt.sign(playload,"note@413");
    //response.status(400)
    response.send(jwtToken)

  }else{
    response.send(400)
    response.send("Invalid password")

  }
    
    }
})

// authentication user 

const actunticationjwtToken = (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    
    if (authHeader !== undefined) {
        jwtToken = authHeader.split(" ")[1];
    }
    
    if (jwtToken === undefined) {
        return response.status(401).send("User unauthorized");
    } else {
        jwt.verify(jwtToken, "note@413", async (error, payload) => {
            if (error) {
                return response.status(401).send("Invalid access token");
            } else {
                // Log the payload to ensure it contains the user ID
                console.log("Decoded payload: ", payload);
                
                if (!payload || !payload.id) {
                    return response.status(400).send("User ID is missing. Authentication failed.");
                }
                
                request.userId = payload.id;
                console.log("User ID: ", request.userId);  // Log to verify the userId
                next();
            }
        });
    }
};


//get notes
app.get('/notes',actunticationjwtToken, async (req, res) => {
    const notes = await db.all(`SELECT * FROM notes WHERE user_id = ? ORDER BY pinned DESC, created_at DESC`, [req.userId]);
    res.json(notes);
});


// Create Note
app.post('/notes', actunticationjwtToken, async (req, res) => {
    const { title, content, category } = req.body;

    // Debugging: Log user ID to confirm it's correctly extracted
    console.log("User ID from Token:", req.userId); 

    if (!req.userId) {
        return res.status(400).json({ error: "User ID is missing. Authentication failed." });
    }

    try {
        const result = await db.run(
            `INSERT INTO notes (title, content, category, created_at, updated_at, pinned, archived, user_id) 
             VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 0, ?)`,
            [title, content, category, req.userId]
        );

        const newNote = await db.get(`SELECT * FROM notes WHERE id = ?`, [result.lastID]);

        res.status(201).json(newNote);
    } catch (error) {
        console.error("Error inserting note:", error);
        res.status(500).json({ error: "Error creating note" });
    }
});


//put method update

app.put("/notes/:id", actunticationjwtToken, async(req,res) => {
    const {title,content,category} = req.body;
    const {id} = req.params;
    const adduser = `
    UPDATE notes SET title = '${title}', content = '${content}', category='${category}' WHERE id = ${id};`;
    const userresponse = await db.run(adduser)
    //const updateId = userresponse.lastId
    res.send("success updated")
})


// detele 
app.delete("/notes/:id/",actunticationjwtToken, async (request,response) => {
    const {id} = request.params
    const deleteuser = `
    DELETE FROM notes WHERE id = ${id};
    `;
    const userresponse = await db.run(deleteuser)
    response.send("sucess deteled")

})
//delete all  
app.delete("/notes/",actunticationjwtToken, async (request,response) => {
    const deleteuser = `
    DELETE FROM notes;
    `;
    const userresponse = await db.run(deleteuser)
    response.send("sucess deteled all")

})

//pinned 
app.patch("/notes/:id/pin",actunticationjwtToken, async (request,response) => {
    const { pinned } = request.body;
    const {id} = request.params;
    const pinneduser = `UPDATE notes SET pinned = '${pinned}' WHERE id = ${id};`;
    const userresponse = await db.run(pinneduser)
    response.send("sucess pinned")

})

// archive
app.patch("/notes/:id/archive",actunticationjwtToken, async (request,response) => {
    const { archived } = request.body;
    const {id} = request.params;
    const archiveuser = `UPDATE notes SET archived= '${archived}' WHERE id = ${id};`;
    const userresponse = await db.run(archiveuser)
    response.send("sucess archive")

})

module.exports = app
