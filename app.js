const   express             = require("express"),
        app                 = express(),
        bodyParser          = require("body-parser"),
        mysql               = require("mysql2"),
        session             = require('express-session'),
        cookieParser        = require('cookie-parser'),
        passport            = require('passport'),
        flash               = require('connect-flash'),
        methodOverride      = require("method-override");

require('./config/passport')(passport);

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/"));
app.use(methodOverride("_method")); 
app.use(flash());

app.use(session({
    secret: 'justasecret',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

const connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : '!LoveMySQL2308',
    database : 'lib'
});

connection.connect((err) => {
    if(err){
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Connected as id ' + connection.threadId);
});


// AUTH ROUTES
// --------------------

app.get('/login', (req, res) => {
    res.render('auth/login', {message: req.flash('loginMessage')});
});

app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/books',
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => {
    if(req.body.remember){
        req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000;
    }else{
        req.session.cookie.expires = false;
    }
    res.redirect('/');
});

app.get('/signup', (req, res) => {
    res.render('auth/signup', {message: req.flash('signupMessage')});
});

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/books',
    failureRedirect: '/signup',
    failureFlash: true
}));

app.get('/logout', (req,res) => {
    req.logout();
    res.redirect('/');
});

// --------------------

app.get("/members", (req, res) => {
    let q1 = "SELECT * FROM members;"
    connection.query(q1, (error, results, fields) => {
        let data = [];
        if(error){
            throw error;
        }
        results.map(d => {
            return data.push(d);
        });
        res.render("members/index", {data: data});    
    });
});

app.get("/suppliers", (req, res) => {
    let q1 = "SELECT * FROM suppliers;"
    connection.query(q1, (error, results, fields) => {
        let data = [];
        if(error){
            throw error;
        }
        results.map(d => {
            return data.push(d);
        });
        res.render("suppliers/index", {data: data});    
    });
});

app.get("/publishers", (req, res) => {
    let q1 = "SELECT * FROM publishers;"
    connection.query(q1, (error, results, fields) => {
        let data = [];
        if(error){
            throw error;
        }
        results.map(d => {
            return data.push(d);
        });
        res.render("publishers/index", {data: data});    
    });
});

app.get("/books", (req, res) => {
    let q1 = "SELECT * FROM books;"
    connection.query(q1, (error, results, fields) => {
        let data = [];
        if(error){
            throw error;
        }
        results.map(d => {
            return data.push(d);
        });
        res.render("books/index", {data: data, message: req.flash("success")});    
    });
});

// Add book in DB
app.get("/book/new", (req, res) => {
    res.render("books/newBook");
});

app.post("/books", (req, res) => {
    let q5 = "INSERT INTO books(title, categories, authors, total) ";
    const { title, categories, authors, total } = req.body;
    q5 += `VALUES("${title}", "${categories}", "${authors}", ${total});`;
    connection.query(q5, (error, results, fields) => {
        if(error){
            throw error;
        }
        let q = "SELECT * FROM books;";
        connection.query(q, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            return res.redirect(301, "books");
        });
    });
});


//Add member in DB
// Here, we need to make sure we are giving the choice of admin/member
app.get("/member/new", (req, res) => {
    res.render("members/newMember");
});

app.post("/members", (req, res) => {
    const { fName, lName, address, mobile, membershipExpiry, membershipDOI } = req.body;
    let q6 = "INSERT INTO members(address, mobile, fName, lName, membershipDOI, membershipExpiry) ";
    q6 += `VALUES("${address}", "${mobile}", "${fName}", "${lName}", "${membershipDOI}", "${membershipExpiry}");`;
    connection.query(q6, (error, results, fields) => {
        let q = "SELECT * FROM members;";
        connection.query(q, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            return res.render("members/index", {data: data});
        }); 
    });
});

//Delete member detail in DB
app.delete("/members/:id", (req, res) => {
    let q1 = `DELETE FROM members WHERE mid = ${req.params.id};`;
    connection.query(q1, (error, results, fields) => {
        let q = "SELECT * FROM members;";
        connection.query(q, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            return res.render("members/index", {data: data});
        });
    });
});

// Update member detail in DB
app.get("/members/:id/edit", (req, res) => {
    let q = `SELECT * FROM members WHERE mid = ${req.params.id}`
    connection.query(q, (error, results, fields) => {
        if(error){
            throw error;
        }
        res.render("members/updateMember", {data: results});
    });
});

app.put("/members/:id", (req, res) => {
    const { fName, lName, address, mobile } = req.body;
    let q = `UPDATE members `;
    q += `SET fName = "${fName}", address = "${address}", lName = "${lName}", mobile = "${mobile}" `;
    q += `WHERE mid = ${req.params.id};`;
    connection.query(q, (error, results, fields) => {
        let q1 = "SELECT * FROM members;";
        connection.query(q1, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            return res.render("members/index", {data: data});
        }); 
    });
});

//Add supplier in DB
app.get("/supplier/new", (req, res) => {
    res.render("suppliers/newSupplier");
});

app.post("/suppliers", (req, res) => {
    const { name, address, mobile } = req.body;
    let q7 = "INSERT INTO suppliers(address, mobile, name) ";
    q7 += `VALUES("${address}", "${mobile}", "${name}");`;
    connection.query(q7, (error, results, fields) => {
        let q = "SELECT * FROM suppliers;";
        connection.query(q, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            return res.render("suppliers/index", {data: data});
        }); 
    });
});

//Add publisher in DB
app.get("/publisher/new", (req, res) => {
    res.render("publishers/newPublisher");
});

app.post("/publishers", (req, res) => {
    const { name, address, mobile } = req.body;
    let q8 = "INSERT INTO publishers(address, mobile, name) ";
    q8 += `VALUES("${address}", "${mobile}", "${name}");`;
    connection.query(q8, (error, results, fields) => {
        let q = "SELECT * FROM publishers;";
        connection.query(q, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            return res.render("publishers/index", {data: data});
        }); 
    });
});

// Update book detail in DB
app.get("/books/:id/edit", (req, res) => {
    let q = `SELECT * FROM books WHERE bid = ${req.params.id}`
    connection.query(q, (error, results, fields) => {
        if(error){
            throw error;
        }
        res.render("books/updateBook", {data: results});
    });
});

app.put("/books/:id", (req, res) => {
    const { title, categories, authors, total} = req.body;
    let q = `UPDATE books `;
    q += `SET title = "${title}", categories = "${categories}", authors = "${authors}", total = ${total} `;
    q += `WHERE bid = ${req.params.id};`;
    connection.query(q, (error, results, fields) => {
        let q1 = "SELECT * FROM books;";
        connection.query(q1, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            return res.render("books/index", {data: data, message: req.flash("success")});
        }); 
    });
});

// Delete book detail in DB
app.delete("/books/:id", (req, res) => {
    let q1 = `DELETE FROM books WHERE bid = ${req.params.id};`;
    connection.query(q1, (error, results, fields) => {
        let q = "SELECT * FROM books;";
        connection.query(q, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            return res.render("books/index", {data: data, message: req.flash("success")});
        });
    });
});

// Delete publisher detail in DB
app.delete("/publishers/:id", (req, res) => {
    let q1 = `DELETE FROM publishers WHERE pid = ${req.params.id};`;
    connection.query(q1, (error, results, fields) => {
        let q = "SELECT * FROM publishers;";
        connection.query(q, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            return res.render("publishers/index", {data: data});
        });
    });
});


// Delete supplier detail in DB
app.delete("/suppliers/:id", (req, res) => {
    let q1 = `DELETE FROM suppliers WHERE sid = ${req.params.id};`;
    connection.query(q1, (error, results, fields) => {
        let q = "SELECT * FROM suppliers;";
        connection.query(q, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            return res.render("suppliers/index", {data: data});
        });
    });
});


// Update Publisher detail in DB
app.get("/publishers/:id/edit", (req, res) => {
    let q = `SELECT * FROM publishers WHERE pid = ${req.params.id}`
    connection.query(q, (error, results, fields) => {
        if(error){
            throw error;
        }
        res.render("publishers/updatePublisher", {data: results});
    });
});

app.put("/publishers/:id", (req, res) => {
    const { address, mobile, name} = req.body;
    let q = `UPDATE publishers `;
    q += `SET address = "${address}", name = "${name}", mobile = "${mobile}" `;
    q += `WHERE pid = ${req.params.id};`;
    connection.query(q, (error, results, fields) => {
        let q1 = "SELECT * FROM publishers;";
        connection.query(q1, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            return res.render("publishers/index", {data: data});
        }); 
    });
});


// Update Supplier detail in DB
app.get("/suppliers/:id/edit", (req, res) => {
    let q = `SELECT * FROM suppliers WHERE sid = ${req.params.id}`
    connection.query(q, (error, results, fields) => {
        if(error){
            throw error;
        }
        res.render("suppliers/updateSupplier", {data: results});
    });
});

app.put("/suppliers/:id", (req, res) => {
    const { address, mobile, name} = req.body;
    let q = `UPDATE suppliers `;
    q += `SET address = "${address}", name = "${name}", mobile = "${mobile}" `;
    q += `WHERE sid = ${req.params.id};`;
    connection.query(q, (error, results, fields) => {
        let q1 = "SELECT * FROM suppliers;";
        connection.query(q1, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            return res.render("suppliers/index", {data: data});
        }); 
    });
});



// HANDLING RENTS
app.get("/rent", (req, res) => {
    res.render("rent");
});

app.post("/rent", (req, res) => {
    const { mid, bid, doi, dor } = req.body;
    let q = `INSERT INTO borrowers `;
    q += `VALUES(${mid}, ${bid}, "${doi}", "${dor}");`;
    connection.query(q, (error, results, fields) => {
        let q1 = "SELECT * FROM books;";
        connection.query(q1, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            req.flash("success", `Book rented successfully!`);
            return res.render("books/index", {data: data, message: req.flash("success")});
        }); 
    });
});

//HANDLING RETURNS
app.get("/return", (req, res) => {
    res.render("return", {message: req.flash('loginMessage')});
});

app.post("/return", (req, res) => {
    const { mid, bid, edor, dor } = req.body;
    const dorDate = new Date(dor);
    const edorDate = new Date(edor);
    const diff = Math.abs(dorDate - edorDate);
    const days = Math.floor(diff / 86400000);
    let q = `INSERT INTO returns `;
    q += `VALUES (${mid}, ${bid}, ${days}); `;
    connection.query(q, (error, results, fields) => {
        let q1 = "SELECT * FROM books;";
        connection.query(q1, (error, finalRes, fields) => {
            let data = [];
            if(error){
                throw error;
            }
            finalRes.map(d => {
                return data.push(d);
            });
            if(days >= 0){
                req.flash("success", `The late return fine of the book is ₹${days*5}!`);
            }else{
                req.flash("success", `There is no fine as this book was returned on time!`);
            }
            return res.render("books/index", {data: data, message: req.flash("success")});
        }); 
    });
});

app.get("/", (req, res) => {
    res.render('auth/signup', {message: req.flash('signupMessage')});
});

app.listen(3000, () => (
    console.log("Server listening on port 3000")
));