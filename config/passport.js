const LocalStrategy = require("passport-local").Strategy;

const mysql = require('mysql2');
const bcrypt = require('bcrypt-nodejs');
const dbconfig = require('./database');
const connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {
    passport.serializeUser((user, done) => {
    done(null, user.aid);
});

passport.deserializeUser(function(id, done){
    connection.query("SELECT * FROM admins WHERE aid = ? ", [id],
    function(err, rows){
        done(err, rows[0]);
    });
});

passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'username',
            passwordField: 'password',
            passReqToCallback: true
        }, (req, username, password, done) => {
            connection.query("SELECT * FROM admins WHERE username = ? ", 
            [username], (err, rows) => {
            if(err)
                return done(err);
            if(rows.length){
                return done(null, false, req.flash('signupMessage', 'Username already taken'));
            }else{
                var newUserMysql = {
                username: username,
                password: bcrypt.hashSync(password, null, null)
                };
                var insertQuery = "INSERT INTO admins (username, password) values (?, ?)";
                connection.query(insertQuery, [newUserMysql.username, newUserMysql.password], (err, rows) => {
                    newUserMysql.aid = rows.insertId;
                    return done(null, newUserMysql);
                });
            }
        });
    })
);

passport.use(
        'local-login',
        new LocalStrategy({
        usernameField : 'username',
        passwordField: 'password',
        passReqToCallback: true
        },
        (req, username, password, done) => {
            connection.query("SELECT * FROM admins WHERE username = ? ", [username],
            (err, rows) => {
                if(err)
                    return done(err);
                if(!rows.length || !bcrypt.compareSync(password, rows[0].password)){
                    return done(null, false, req.flash('loginMessage', 'Username Or Password Was Incorrect'));
                }
                return done(null, rows[0]);
            });
        })
    );
};