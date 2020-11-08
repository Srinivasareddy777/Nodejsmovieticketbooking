var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')
var moment = require('moment')
const {check,validationResult} = require('express-validator');
const session = require('express-session');
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'ejs');
const path = require('path');
app.use(express.static(path.join(__dirname,'public')))
app.use(session({secret: 'komarti',saveUninitialized: true,resave: true}));
app.use(function(req, res, next) {
  res.locals.sess = req.session;
  next();
});





var url = "mongodb://localhost:27017/moviesd";
MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});


MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
  if (err) throw err;
  var dbo = db.db("moviesd");
  dbo.createCollection("users", function(err, res) {
    db.close();
  });

  dbo.createCollection("movies", function(err, res) {
    db.close();
  });

  dbo.createCollection("users_movies", function(err, res) {
    db.close();
  });


});





MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
  if (err) throw err;
  var dbo = db.db("moviesd");
  var myobj = [
    {  id: 2, name:  'That is MahaLakshmi'},
    {  id: 3, name:  'Majili'},
    {  id: 4, name:  'Suryakantham'},
    {  id: 5, name:  'Geetha Govindam'},
    {  id: 6, name:  'Tholiprema'},
    {  id: 7, name:  'GangLeader'},
    {  id: 8, name:  'Syeraa'},
    {  id: 9, name:  'Chanakya'},
    {  id: 10, name: 'Saaho'},
    {  id: 11, name: 'Simbaa'},
    {  id: 12, name: 'URI'},
    {  id: 13, name: 'Super 30'},
    {  id: 14, name: 'Bharat'},
    {  id: 15, name: 'Kalank'},
    {  id: 16, name: 'Gully Boy'},
    {  id: 17, name: 'Badla'},
    {  id: 18, name: 'Luka Chuppi'},
    {  id: 19, name: 'Total Dhamaal'},
    {  id: 20, name: 'Spider man far from home'},
    {  id: 21, name: 'Hobbs and shaw'},
    {  id: 22, name: 'Joker'},
    {  id: 23, name: 'Gemini Man'},
    {  id: 24, name: 'John wick 3'},
    {  id: 25, name: 'Shazam'},
    {  id: 26, name: 'Maleficient 2'},
    {  id: 27, name: 'Aladdin'},
    {  id: 28, name: 'IT'}
  ];
  dbo.collection("movies").insertMany(myobj, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    
   
    db.close();
  });
});



var sess;

app.get('/', function(req, res) {
        res.render('pages/index');  
});

app.get('/all', function(req, res) {
    res.render('pages/all');
});

app.get('/telugu', function(req, res) {
    res.render('pages/telugu');
});

app.get('/hindi', function(req, res) {
    res.render('pages/hindi');
});

app.get('/english', function(req, res) {
    res.render('pages/english');
});

app.get('/signup', function(req, res) {
    res.render('pages/signup');
});

app.post('/signup_check', urlencodedParser ,  [
    check('fname', 'Firstname must me 3+ characters long')
        .trim()
        .exists()
        .isLength({ min: 3 }),
    check('lname', 'Lastname must me 3+ characters long')
        .trim()
        .exists()
        .isLength({ min: 3 }),
    check('email_id', 'Email is not valid')
        .trim()
        .isEmail()
        .normalizeEmail(),
    check('pass1', 'Password length should be minimum 6 characters') 
        .isLength({ min: 6}),
    check('pass2', 'Passwords do not match') 
        .custom((value,{req, loc, path}) => {
            if (value !== req.body.pass1) {
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        }),
    check('phone', 'Mobile number should contains 10 digits') 
        .trim()
        .isLength({ min: 10, max: 10 })
], (req, res)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()) 
    {
        const alert = errors.array()
        res.render('pages/signup', {
            alert,
            data: req.body
        })


    }

    else{


                MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
                  if (err) throw err;
                  var dbo = db.db("moviesd");

                   dbo.collection("users").findOne({email_id: req.body.email_id}).then(function(result)
                {
                     if( result !== null )
                     {
                          console.log('email exists')
                          const alert2 = "email not exist"
                          res.render('pages/signup',{
                                 msg:'Email already exists',
                                 alert2,
                                 data: req.body
                            })
                     }

                     else
                     {
                        sess = req.session;
                        var myobj = {  
                                 First_name: req.body.fname, 
                                 Last_name: req.body.lname, 
                                 email_id: req.body.email_id, 
                                 password: req.body.pass1, 
                                 phone: req.body.phone 
                              };

                          sess.email = req.body.email_id;
                          sess.uname = req.body.fname;
                          sess.phone = req.body.phone;
                         

                           dbo.collection("users").insertOne(myobj, function(err, res) {
                             if (err) throw err;
                             console.log("1 user inserted into databse");
                              db.close();
                           });
                           res.redirect('/')
                    }
                     
                });


                 
                });
                
    }

});



app.get('/login', function(req, res) {
    res.render('pages/login');
});



app.post('/login_submit', urlencodedParser , function(req, res) {
    
   

    var email_id = req.body.email_id
    var pass = req.body.pass



    MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) 
       {
                  if (err) throw err;
                  var dbo = db.db("moviesd");
                     
                     var result = dbo.collection("users").findOne({email_id: email_id, password: pass }).then(function(result)
                {
                     if( result !== null )
                     {
                          console.log('user successfully logged in')
                          sess = req.session;
                          sess.email = email_id;
                          sess.uname = result.First_name;
                          sess.phone = result.phone;
                          
                          res.redirect('/')}

                     
                     else{
                        console.log('wrong email/password entered')
                        const alert2 = "wrong email/password entered"
                        res.render('pages/login',{
                                 msg:'wrong email/password entered',
                                 alert2,
                                 data: req.body
                            })
                     }

                     db.close()
                     
                });

                     
                 
        });
});






app.get('/logout', urlencodedParser , function(req, res) {
       var x = req.session.uname
       console.log(x+' has logged out')
       req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });
})


app.get('/settings', function(req, res) {
    res.render('pages/settings');
});


var EventEmitter  = require('events')
var emitter = new EventEmitter();


app.post('/settings_script',  urlencodedParser , function(req, res) {
    
    sess = req.session
       var fname = req.body.fname
       var lname = req.body.lname
       var pass1 = req.body.pass1
       var pass2 = req.body.pass2
       var pass3 = req.body.pass3
       var phone = req.body.phone
       var email = sess.email

       MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) 
       {
                  if (err) throw err;
                  var dbo = db.db("moviesd");

                  if(fname !== undefined && lname !== undefined)
                  {

                    var result = dbo.collection("users").findOneAndUpdate({ "email_id" : email }, {$set: {"First_name" : fname, "Last_name": lname}}).then(function(result)
                  
                {
                    sess.uname = fname;
                    console.log("names changed succefully")
                     db.close()
                     res.redirect('/')
                     
                });


                  }

                  else if(pass1!== undefined && pass2 !== undefined && pass3!== undefined){

                    var result = dbo.collection("users").findOne({email_id: email}).then(function(result)
                {
                          if(pass1 == result.password){

                           if(pass2 == pass3){

                              var result = dbo.collection("users").findOneAndUpdate({ "email_id" : email }, {$set: {"password" : pass2}}).then(function(result)
                {
                    console.log("password changed successfully")
                     db.close()
                     res.redirect('/')
                     
                });

                           }

                           else{
                                  
                                   res.render('pages/settings',{
                                 msg2:'new passwords do not match'
                                 
                            })
                           }
                      }

                      else{
                           

                           res.render('pages/settings',{
                                 msg2:'wrong old password'
                                 
                            })

                  }     
                     
                });

                  }


                  else if(phone !== undefined){

                    

                    if(phone < 6000000000 || phone > 9999999999 ){
                        res.render('pages/settings',{
                                 msg3:'wrong phone number'
                                 
                            })
                    }

                    else{

                        var result = dbo.collection("users").findOneAndUpdate({ "email_id" : email }, {$set: {"phone" : phone}}).then(function(result)
                {
                    console.log("phone number changed successfully")
                     db.close()
                     res.redirect('/')
                     
                });
                    }

                    

                  }
                   

                   



                     
                 
        });



});




app.get('/book/:id', (req,res)=> {
   sess = req.session;
   const bid = Number(req.params.id)
  sess.mid = bid

    MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) 
       {
        if (err) throw err;
                  var dbo = db.db("moviesd");
    var result = dbo.collection("movies").findOne({id: bid}).then(function(result)
      {
        if(result !== null)
        {
            
         var mov = result.name
         mov = mov.replace(/"/g,"");
   
         sess.movie = mov

        }
         db.close()
         res.render('pages/book',{id: bid, mov: sess.movie});
      })

  })
    
})


app.post('/book_script', urlencodedParser ,(req,res)=>{
  var price = req.body.price
  var date1 = req.body.date1
  
   req.session.price = price
   req.session.date = date1

   var date2 = moment().format('YYYY-MM-DD');
   var date3 = moment().format('2021-MM-DD');
   
   const alert2 = "date"
   if((date1 < date2 || date1 > date3) && price < 1){
          res.render('pages/book',{id: sess.mid, mov: sess.movie, msg1: "Minimum no of tickets is 1" , msg2: "Enter valid date" ,alert2 , data: req.body});
   }
    
   else if(price < 1){
       res.render('pages/book',{id: sess.mid, mov: sess.movie, msg1: "Minimum no of tickets is 1" ,alert2 , data: req.body});
   }
   else if(date1 < date2 || date1 > date3){
          res.render('pages/book',{id: sess.mid, mov: sess.movie, msg2: "Enter valid date"  ,alert2 , data: req.body});
   }
   else{
    res.redirect('/pay')
   }
    
   
})





app.get('/pay',(req,res)=>{
 var sess = req.session
  name = sess.uname
  email  = sess.email
  mid =  sess.mid
  price = sess.price
  date = sess.date
  total = price *250 + price *10;
  sess.total = total

MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) 
       {
        if (err) throw err;
          var dbo = db.db("moviesd");
          var result = dbo.collection("users_movies").findOne({First_name: name , email_id: email , mid : mid , no_of_tickets : price , total : total , date: date , status : "pending" }).then(function(result)
      {
           if(result == null){
            
                var myobj = {  
                                 First_name: name, 
                                 email_id: email, 
                                 mid: mid, 
                                 no_of_tickets : price,
                                 total : total,
                                 date: date, 
                                 status : "pending"
                              };
                         

                           dbo.collection("users_movies").insertOne(myobj, function(err, res) {
                             if (err) throw err;
                             console.log("1 user_movies inserted into database");
                              db.close();
                           });

           }

      })
    })
      


  res.render('pages/pay',{total,name})
})



app.post('/pay_validations', urlencodedParser ,(req,res)=>{

var sess  = req.session
  var number = req.body.cardNumber
  var cvv = req.body.cvv
  var bname = req.body.name
  number = number.split(" ").join("").trim()

   var myregexp1 = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/
   var myregexp2 = /^(?:5[1-5][0-9]{14})$/
   var myregexp3 = /^(?:3[47][0-9]{13})$/

   var match1 = myregexp1.exec(number)
   var match2 = myregexp2.exec(number)
   var match3 = myregexp3.exec(number)

  sess.bname = bname
  var name = sess.uname
  var total  = sess.total

  if(!match1 && !match2 && !match3)
  {
     var msg1 = "Please enter valid card number";
     var alert2 = "invalid"
     res.render('pages/pay',{total,name,msg1,alert2 , data: req.body})
  }
  else{

         MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) 
       {
                  if (err) throw err;
                  var dbo = db.db("moviesd"); 
                  var result = dbo.collection("users_movies").findOneAndUpdate({First_name: name , email_id: email , mid : mid , no_of_tickets : price , total : total , date: date , status : "pending" }, {$set: {"status" : "booked"}}).then(function(result)
                {
                     if(result !== null){
                     db.close()
                     res.redirect('/success')
                   }
                     
                });

                })
         
  }

})


app.get('/success',(req,res)=>{
	var sess = req.session
	res.render('pages/success',{
   
  name  : sess.bname,
  mid  :  sess.mid,
  price  : sess.price,
  date  : sess.date,
  mname  : sess.movie,
  total   : sess.total
	})
})






app.listen(8080);



