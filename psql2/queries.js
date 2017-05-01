var promise = require('bluebird');
var moment = require('moment');

var Pushwoosh = require('pushwoosh-client');
var p_client= new Pushwoosh("1F600-CFB01", "u7gm561R9iT4ni9TLkuA0Qp54O6RdeURbxsjtxwiVPpwiRPmeu5e2Xt7WuHICRS6PJQv9GNMGn8rq7BhpJDZ");
var rest = require('./node_modules/restler');

var options = {
  // Initialization Options
  promiseLib: promise
};
// postgres://postgres:^2b5t3n@@202.92.153.55/csu_app_osa
var pgp = require('pg-promise')(options);
// var connectionString = 'postgres://osaapp:^2b5t3n@@127.0.0.1:5432/csu_app_osa';
var connectionString = 'postgres://postgres:p@ssw0rd@localhost/osaapp';
// var connectionString = 'postgres://postgres:eragon1@localhost/osaapp';
var db = pgp(connectionString);
var express = require('express');
var app = express();
var pg = require('pg');
var client = new pg.Client(connectionString);
var latest;
var AnnounecementTimestamp;
var recepient;
var up_mail;
var recepients = [];
client.connect();
var jobCount;
var eventCount;




//functions for mobile
function getAllUsers(req, res, next) {
  db.any('select * from users')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved users'
        });
    })
    .catch(function (err) {
      return res.status(200).json ({
        statis: 'error'
      })
    });
}



//enter upmail and pass and check validity
function postDetails (req, res, next) {
  var mail = req.body.up_mail;
  var password = req.body.password;
  response = {
   up_mail:req.body.up_mail,
   pass:req.body.password
  };
  console.log(mail, password);
  db.one('select * from users where up_mail = $1 and pass = $2', [mail, password])
  .then(function (data) {
    res.status(200)
      .json({
        status: 'success',
        data: data
      });
  })
  .catch(function (err) {
    return res.status(200).json ({
      status: 'error'
    })
  });
}

//enter upmail get orgs
function orgDetails (req, res, next) {
  var mail = req.body.up_mail;
  console.log(mail);
  db.any('select * from membership where email = $1', mail)
  .then(function (data) {
    res.status(200)
      .json({
        data: data,
      });
  })
  .catch(function (err) {
    return res.status(200).json ({
      status: 'error'
    })
  });
}

function postOrgs (req, res, next) {
  var mail = req.body.up_mail,
      pType = req.body.post_type,
      pTitle = req.body.post_title,
      pDescri = req.body.post_description,
      pRece = req.body.recepient,
      pOrgName = req.body.organization_name;
  var status = 'APPROVED',
      timestamp = moment().format('YYYY-MM-DD[T]HH:mm:ss');
    
    db.tx(function (t) {

    var q1 = this.none('insert into posts (up_mail, timestamp, post, title, description, status)' +
            'values ($1, $2, $3, $4, $5, $6)', [mail, timestamp, pType, pTitle, pDescri, status]);
    var q2 = this.any('insert into org_post (orgpost_id, recepient, org_name)' +
              'values ($1, $2, $3)', [timestamp, pRece, pOrgName])
    })
    .then(function (data) {
      res.status(200)
        .json({
          status:'posted'
        })
    })
    .catch(function (error) {
      return res.status(200)
        .json({
          status:'error'
        })
    });
}

function OsaAnnouncement(req, res, next) {
  var org = 51;
  var events = [];
  db.any('select title, description,timestamp from posts inner join announcement on announcement_id = posts.timestamp group by posts.timestamp having count (*) = $1', org)
    .then(function (data) {
    for(var i=0;i<data.length;i++) {
      data[i].timestamp = moment(data[i].timestamp).format("YYYY-MM-DD");
    }
      console.log(data)
      res.status(200)
        .json({
          data:data
        });
    })
    .catch(function (err) {
      return res.status(200).json ({
        status: 'error'
      })
    });
}


function OrgAnnouncements (req,res, next) {
  var org = req.body.organization_name,
      rece = 'MEMBERS',
      org3 = org;
  db.any ('select title, description, timestamp from posts left outer join org_post on orgpost_id = posts.timestamp left outer join announcement on posts.timestamp = announcement_id where (org_name = $1 and org_post.recepient = $2)  or announcement.recepient = $3' , [org, rece, org3])
    .then(function (data) {
      for(var i=0; i<data.length;i++) {
        data[i].timestamp = moment(data[i].timestamp).format("YYYY-MM-DD");
      }     
      res.status(250).json ({
        data:data
      });
    })
    .catch(function (err) {
      return res.status(250).json ({
        status:'error'
      })
    });
}


function jobPost (req, res, next) {
  var mail = req.body.up_mail,
      pType = 'JOB HIRING',
      pTitle = req.body.post_title,
      pDescri = req.body.post_description,
      status = 'PENDING',
      pref = req.body.preference,
      requirements = req.body.requirements,
      dets = req.body.details,
      jType = req.body.jobtype,
      comp = req.body.company,
      deadline = req.body.deadline;

  var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

      console.log('mail: ' + mail);
      console.log('ptype: ' + pType);
      console.log('ptitle: ' + pTitle);
      console.log('pDescri: ' + pDescri);
      console.log('status: ' + status);
      console.log('pref: ' + pref);
      console.log('requirements: ' + requirements);
      console.log('dets: ' + dets);

    db.tx(function (t) {
      var q1 = this.none('insert into posts (up_mail, timestamp, post, title, description, status)' +
              'values ($1, $2, $3, $4, $5, $6)', [mail, timestamp, pType, pTitle, pDescri, status]);
      var q2 = this.any('insert into job_hiring (job_id, preference, requirements, details, jobtype, company, deadline)' +
                'values ($1, $2, $3, $4, $5, $6, $7)', [timestamp, pref, requirements, dets, jType, comp, deadline])
    })
    .then(function (data) {
      res.status(200)
        .json({
          status:'posted'
        })
    })
    .catch(function (error) {
      return res.status(200)
        .json({
          status:'error'
        })
    });
}

function cEvent(timestamp, e_type, sched, venue, host, recepient, org_recepient) {
  client.query('insert into events (event_id, event_type, schedule, venue, host, recepient, org_recepient) VALUES($1, $2, $3, $4, $5, $6, $7)', [timestamp, e_type, sched, venue, host, recepient, org_recepient], function(err, result) {
    if(err) {
      console.log('wala ka naka insert bes');
    }
  });
}

function eventPost(req, res, next) {
  var mail = req.body.up_mail,
      pType = 'EVENTS',
      pTitle = req.body.post_title,
      pDescri = req.body.post_description,
      status = 'PENDING',
      e_type = req.body.event_type,
      sched = req.body.schedule,
      venue = req.body.venue;
      host = req.body.host,
      recepient = req.body.recepient;
      org_recepient = host;

  var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

  client.query('SELECT organization_name from organization', function(err, results) {

    client.query('INSERT INTO posts(up_mail, timestamp, post, title, description, status) VALUES($1, $2, $3, $4, $5, $6)', [mail, timestamp, pType, pTitle, pDescri, status]);
    if(recepient == 'ALL') {
      client.query('SELECT timestamp FROM posts ORDER BY timestamp DESC', function(err, result) {
        for(var i=0; i<results.rows.length; i++) {
          org_recepient = results.rows[i].organization_name;
          // console.log(org_recepient);
          cEvent(timestamp, e_type, sched, venue, host, recepient, org_recepient);
        }
      });
    } else {
      client.query('SELECT timestamp FROM posts ORDER BY timestamp DESC', function(err, result) {
        cEvent(timestamp, e_type, sched, venue, host, recepient, org_recepient);
        // recepients = recepients + org_recepient + ', ';
      });
    }
  })
  .then(function (data) {
    // console.log(data);
    res.status(200)
      .json({
        status:'posted'
      })
  })
  .catch(function (error) {
    return res.status(200)
      .json({
        status:'error'
      })
  });
}


function announcementPost (req, res, next) {
  var mail = req.body.up_mail,
      pType = req.body.post_type,
      pTitle = req.body.post_title,
      pDescri = req.body.post_description,
      status = 'APPROVED',
      e_type = req.body.event_type,
      sched = req.body.schedule,
      venue = req.body.venue;
  var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    db.tx(function (t) {
      var q1 = this.none('insert into posts (up_mail, timestamp, post, title, description, status)' +
              'values ($1, $2, $3, $4, $5, $6)', [mail, timestamp, pType, pTitle, pDescri, status]);
      var q2 = this.any('insert into events (event_id, event_type, schedule, venue)' +
                'values ($1, $2, $3, $4)', [timestamp, e_type, sched, venue])
    })
    .then(function (data) {
      res.status(200)
        .json({
          status:'posted'
        })
    })
    .catch(function (error) {
      return res.status(200)
        .json({
          status:'error'
        })
    });
}

function HomeEvents (req, res, next) {
  var mail = req.body.up_mail;

  db.any ('select title, timestamp, recepient, description, venue from posts inner join events on event_id = timestamp where host in (select org_name from membership where email = $1) order by timestamp', up_mail)
  .then(function (data) {
    for(var i=0;i<data.length;i++) {
      data[i].timestamp = moment(data[i].timestamp).format("YYYY-MM-DD");
    }            
    res.status(250).json ({
      data:data
    });
  })
  .catch(function (err) {
    return res.status(250).json ({
      status:'error'
    })
  });
}

function OsaEvents (req, res, next) {
  var a = 'OSA'
  db.any('select title, description, venue, timestamp, schedule, host, recepient from posts inner join events on event_id = posts.timestamp where host = $1 group by posts.timestamp,venue,recepient, host,schedule order by schedule', a)
    .then(function (data) {
    for(var i=0;i<data.length;i++) {
      data[i].timestamp = moment(data[i].timestamp).format("YYYY-MM-DD");
      data[i].schedule = moment(data[i].schedule).format("YYYY-MM-DD");
    }
      res.status(200)
        .json({
          data:data
        });
    })
    .catch(function (err) {
      return res.status(200).json ({
        status: 'error'
      })
  });
}


function OrgEvents (req, res, next) {
  var org = req.body.organization_name,
      stat = 'APPROVED',
      rece1 = 'MEMBERS',
      rece2 = 'ALL';

  db.any('select title, description, venue, schedule, recepient, host from posts inner join events on event_id = posts.timestamp where org_recepient = $1 and status = $2 and (recepient = $3 or recepient = $4) group by posts.timestamp,venue,recepient, host, schedule order by schedule;', [org,stat, rece1, rece2])
    .then(function (data) {

    for(var i=0;i<data.length;i++) {
      data[i].schedule = moment(data[i].schedule).format("YYYY-MM-DD");
    }
      res.status(200)
        .json({
          data:data
        });
    })
    .catch(function (err) {
      console.log(err);
      return res.status(200).json ({
        status: 'error'
      })
  });
}

function getJobs (req, res, next) {
  var jType = 'JOB';
  db.any('select title, description, details, preference, requirements, deadline, company from posts inner join job_hiring on job_id = timestamp  where jobtype = $1', jType)
    .then(function (data) {
    for(var i=0;i<data.length;i++) {
      data[i].deadline = moment(data[i].deadline).format("YYYY-MM-DD");
    }
      res.status(200)
        .json({
          data:data
        });
    })
    .catch(function (err) {
      return res.status(200).json ({
        status: 'error'
      })
  });
}


function getIntern (req, res, next) {
  var jType = 'INTERNSHIP';
  db.any('select title, description, details, preference, requirements, deadline, company from posts inner join job_hiring on job_id = timestamp  where jobtype = $1', jType)
    .then(function (data) {
    for(var i=0;i<data.length;i++) {
      data[i].deadline = moment(data[i].deadline).format("YYYY-MM-DD");
    }
      res.status(200)
        .json({
          data:data
        });
    })
    .catch(function (err) {
      return res.status(200).json ({
        status: 'error'
      })
  });  
}


function timelineEvents (req, res, next) {
  var mail = req.body.up_mail,
      rece = 'MEMBERS';

  db.any ('select title, timestamp, description, org_name from posts inner join org_post on orgpost_id = timestamp where org_name in (select org_name from membership where email = $1) and recepient = $2 order by timestamp;', [mail, rece])
  .then(function (data) {
    for(var i=0;i<data.length;i++) {
      data[i].timestamp = moment(data[i].timestamp).format("YYYY-MM-DD");
    }            
    res.status(250).json ({
      data:data
    });
  })
  .catch(function (err) {
    return res.status(250).json ({
      status:'error'
    })
  });
}

function allOrgs (req, res, next) {
  var mail = req.body.up_mail,
      cond1 = 'OPEN',
      cond2 = 'CONDITIONAL',
      stat = 'NONE';

  db.any('select organization_name, member_role from orgStuff left outer join membership on org_name=organization_name and email = $1 where (restriction = $2 or restriction =$3)', [mail, cond1, cond2])
  .then(function (data) {
    for(var i=0; i<data.length; i++) {
      if(data[i].member_role == null) {
        // console.log(data[i].member_role)
        data[i].member_role =  stat;
      }
    }         
    res.status(250).json ({
      data:data
    });
  })
  .catch(function (err) {
    return res.status(250).json ({
      status:'error'
    })
  });
}



function OfficerAnnouncement (req, res, next) {
  var org = req.body.organization_name,
      rece = 'OFFICERS';
  db.any ('select title, description, timestamp from posts inner join org_post on orgpost_id = posts.timestamp where org_name = $1 and recepient = $2' , [org, rece])
    .then(function (data) {
      for(var i=0; i<data.length;i++) {
        data[i].timestamp = moment(data[i].timestamp).format("YYYY-MM-DD");
      }     
      res.status(250).json ({
        data:data
      });
    })
    .catch(function (err) {
      return res.status(250).json ({
        status:'error'
      })
    });      
}

function OfficerEvents (req, res, next) {
  var org = req.body.organization_name,
      stat = 'APPROVED',
      rece2 = 'OFFICERS',
      osa = 'OSA'
      org2 = org.toUpperCase();

  db.any('Select title, description, venue, schedule, recepient, host from posts inner join events on event_id = posts.timestamp where (host = $1 and status = $2 and recepient = $3)  or (host = $4 and org_recepient = $5 and recepient = $6) group by posts.timestamp,venue,recepient, host, schedule order by schedule', [org,stat, rece2, osa, org2,rece2])

    .then(function (data) {

    for(var i=0;i<data.length;i++) {
      data[i].schedule = moment(data[i].schedule).format("YYYY-MM-DD");
    }
      res.status(200)
        .json({
          data:data
        });
    })
    .catch(function (err) {
      console.log(err);
      return res.status(200).json ({
        status: 'error'
      })
  });
}  




































//functions for web
function User(){
    this.first_name = "";
    this.middle_name= ""; //need to declare the things that i want to be remembered for each user in the database
    this.last_name= "";
    this.up_mail= "";
    this.pass= "";
    this.role= "";
    this.cluster= "";
    this.course= "";
    this.year= "";

};

User.findOne = function(req, callback){
    var isNotAvailable = false; 
    console.log(req.up_mail + ' is in the findOne function test');
    client.query('SELECT * from users WHERE up_mail= $1 AND pass=$2', [req.up_mail, req.pass], function(err, result){
        console.log(result.rows);
        if(err){
            console.log(req.up_mail + ' is not available');
            return callback(err, isNotAvailable, this);
        }
        if (result.rows.length > 0){
            console.log(req.up_mail + ' is not available!');
            console.log('the role is ' + result.rows[0].role);
            if(result.rows[0].role == 'OSA') {
              isNotAvailable = true; 
            } else {
              isNotAvailable = false;
            }
        }
        else{
            isNotAvailable = false;
            console.log(req.up_mail + ' is available');
        }
        //client.end();
        return callback(false, isNotAvailable, this);
    });
};

function get(req, res) {
  up_mail = undefined;
  var interval = '7 days';
  client.query('DELETE FROM announcement WHERE timestamp < (now() - interval $1)',[interval], function(err, result) {
    console.log('Deleting old announcements');
    console.log(result);
  });
  client.query('DELETE FROM events WHERE schedule > now() - 1 ', function(err, result) {
    console.log('Deleting old events');
    console.log(result);
  });
  client.query('DELETE FROM job_hiring WHERE deadline > now() - 1', function(err, result) {
    console.log('Deleting old jobs');
    console.log(result);
  });
  console.log('entered');
  console.log("Cookies: ", req.cookies);
  countJobs();
  countEvents();
  res.render('index', {noOfJobs:jobCount, noOfEvents:eventCount});
}


function post(req, res) {
  console.log(req.body.up_mail + " " + req.body.pass);
  console.log(req.body);
  up_mail = req.body.up_mail;
  User.findOne({up_mail: req.body.up_mail, pass: req.body.pass}, function(err, user) {
    if(!user) {
      console.log('does not exist or not OSA');
      countJobs();
      countEvents();
      res.render('index', {message: "Invalid credentials", noOfJobs:jobCount, noOfEvents:eventCount});
      //res.render('index', { error: "Incorrect email/password."});
      //alert("User does not exist!");
    } else {
      // console.log('session object is ' + req.session_state.user);
      req.session_state.user = up_mail;
      console.log('session is ' + req.session_state.user);
      if(req.body.password == user.password) {
        console.log('up mail is ' + up_mail);
          res.redirect('profile');
      } else {
        console.log('wrong password');
        countJobs();
        countEvents();
        res.render('index', {message: "Invalid credentials", noOfJobs:jobCount, noOfEvents:eventCount});
        //res.render('index', { error: "Incorrect email/password."});
        //alert("Incorrect password!");
      }
    }
  });
};


function prof(req, res) {
  console.log('enter profile');
  if(up_mail == undefined) {
    console.log('up mail is: ' + up_mail);
    //res.send(404);
    // countJobs();
    // countEvents();
    // res.render('index', {noOfJobs:jobCount, noOfEvents:eventCount, noOfEvents:eventCount});
    res.redirect('/login')    
  }
  console.log('up mail is ' + up_mail);
  client.query('SELECT * FROM posts ORDER BY timestamp DESC', function(err, result) {
      if(err) {
        return console.error('naay error', err);
      }
      //console.log({posts: result.rows});
      //latest = result.rows[0].timestamp;
      //console.log("latest timestamp is " + latest);
      client.query('SELECT organization_name FROM organization', function(err, result2) {
        if(err) {
          return console.error('naay error', err);
        }
        //console.log({posts: result.rows, organization:result2.rows});
        countJobs();
        countEvents();
        res.render('profile', {posts: result.rows, organization:result2.rows, noOfJobs:jobCount, noOfEvents:eventCount});
      });
      
   });
};

function announce(req, res) {
if(!(req.session_state.user)) {
  res.redirect('/login');
} else {
  console.log('INSIDE Announcement');
  console.log('up mail is ' + up_mail);
  //timestamp = require('moment')().format('YYYY-MM-DD HH:mm:ss');
  timestamp = moment().format('YYYY-MM-DD[T]HH:mm:ss');
  var title = req.body.title;
  var description = req.body.description;
  var recepient;
  var type = 'Announcement';
  var recepients = 'Posted an announcement for ';


  //recepient = req.body.recepient;
  var multiple = req.body.checkBox;
  console.log("Multiple is: " + multiple);
  
  client.query('SELECT organization_name FROM organization', function(err, result) {
    console.log(result.rows);
    if(multiple == false || multiple == undefined) {
      console.log("Checkbox is not checked.");
      recepient = req.body.selectError3;
      recepients = recepients + recepient + '.';
      if(recepient == 'Public') {
        client.query('INSERT INTO posts(up_mail, timestamp, post, title, description, status) VALUES($1, $2, $3, $4, $5, $6)', [up_mail, timestamp, 'ANNOUNCEMENT', title, description, 'APPROVED']);
        for(var i = 0; i < result.rows.length; i++) {
          //timestamp = moment().add(i, 's').format('YYYY-MM-DD HH:mm:ss');
          recepient = result.rows[i].organization_name;
          console.log('timestamp to post for ' + recepient  + ' is ' + timestamp);
          console.log(up_mail + ' is about to post');
          createAnnouncement(title, up_mail, timestamp, description, recepient);
        }

        rest.post('https://twaud.io/api/v1/upload.json', {
          multipart: true,
          username: 'danwrong',
          password: 'wouldntyouliketoknow',
          data: {
            'sound[message]': 'Approved event'
          }
        }).on('complete', function(data) {
          console.log(data.audio_url);
        });

        p_client.sendMessage('New Announcement', function(error, response) {
         if (error) {
          console.log('Some error occurs: ', error);
         }

         console.log('Pushwoosh API response is', response);
        });
      } else {
        client.query('INSERT INTO posts(up_mail, timestamp, post, title, description, status) VALUES($1, $2, $3, $4, $5, $6)', [up_mail, timestamp, 'ANNOUNCEMENT', title, description, 'APPROVED']);
        createAnnouncement(title, up_mail, timestamp, description, recepient);
        recepients = recepients + recepient;
      }
      countJobs();
      countEvents();
      res.render('announce', {message: recepients, orgs: result.rows, noOfJobs:jobCount, noOfEvents:eventCount});
    } else {
      console.log("Checkbox is checked.");
      if(req.body.selectError1 != undefined) {
        var size = req.body.selectError1.length;
        if(size != undefined) {
          client.query('INSERT INTO posts(up_mail, timestamp, post, title, description, status) VALUES($1, $2, $3, $4, $5, $6)', [up_mail, timestamp, 'ANNOUNCEMENT', title, description, 'APPROVED']);
          for(var i = 0; i < size; i++) {
            //timestamp = moment().add(i, 's').format('YYYY-MM-DD HH:mm:ss');
            recepient = req.body.selectError1[i];
            recepients = recepients + recepient + ', ';
            console.log('timestamp to post for ' + recepient  + ' is ' + timestamp);
            console.log(up_mail + ' is about to post');
            createAnnouncement(title, up_mail, timestamp, description, recepient);
          }
          countJobs();
          countEvents();
          res.render('announce', {message: recepients, orgs: result.rows, noOfJobs:jobCount, noOfEvents:eventCount});
        } else {
          console.log("nothing to add");
          countJobs();
          countEvents();
          res.render('announce', {message: "Cannot post announcement", orgs: result.rows, noOfJobs:jobCount, noOfEvents:eventCount});
        }
      } else {
        console.log("nothing to add");
        countJobs();
        countEvents();
        res.render('announce', {message: "Cannot post announcement", orgs: result.rows, noOfJobs:jobCount, noOfEvents:eventCount});
      }
    }
  //res.redirect('announce');
  }); 
}

  
};

function createAnnouncement(title, up_mail, timestamp, description, recepient) {
  console.log('Posted by: ' + up_mail);
  client.query('SELECT timestamp FROM posts ORDER BY timestamp DESC', function(err, result) {
    client.query('INSERT INTO announcement(announcement_id,recepient) VALUES($1,$2)', [timestamp,recepient]);
  });
}

function announce2(req, res) {
    console.log('entering index');
    if(up_mail == undefined) {
      console.log('up mail is: ' + up_mail);
      //res.send(404);
      // countJobs();
      // countEvents();
      // res.render('index', {noOfJobs:jobCount, noOfEvents:eventCount});
      res.redirect('/login') ;     
    }
    client.query('SELECT organization_name FROM organization', function(err, result) {
      if(err) {
        return console.error('i think the database is empty', err);
      }
      console.log(result.rows);
      countJobs();
      countEvents();
      res.render('announce', {orgs:result.rows, noOfJobs:jobCount, noOfEvents:eventCount});
    }); 
};

function announcements(req, res){
  var feed = [];
  if(up_mail == undefined) {
    console.log('up mail is: ' + up_mail);
    //res.send(404);
    // countJobs();
    // countEvents();
    // res.render('index', {noOfJobs:jobCount, noOfEvents:eventCount});
    res.redirect('/login');
  }
  client.query('SELECT * FROM posts WHERE post = $1 ORDER BY timestamp DESC', ['ANNOUNCEMENT'], function(err, result) {
    if(err) {
        return console.error('error running query', err);
    }
    feed = result.rows;
    for(var i=0;i<feed.length;i++) {
      feed[i].announcement_id = moment(feed[i].announcement_id).format('YYYY-MM-DD[T]HH:mm:ss');
      feed[i].timestamp = moment(feed[i].timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
    }
    countJobs();
    countEvents();
    res.render('viewAnnounce', {posts: result.rows, up_mail, noOfJobs:jobCount, noOfEvents:eventCount});
  });
};

function getSchoolEvents(req, res) {
  if(up_mail == undefined) {
    console.log('up mail is: ' + up_mail);
    //res.send(404);
    // countJobs();
    // countEvents();
    // res.render('index', {noOfJobs:jobCount, noOfEvents:eventCount});
    res.redirect('/login')
  }  
  console.log('entering create events');
  if(up_mail == undefined) {
    // console.log('up mail is: ' + up_mail);
    // //res.send(404);
    // countJobs();
    // countEvents();
    // res.render('index', {noOfJobs:jobCount, noOfEvents:eventCount});
    res.redirect('/login');
  }
  console.log('up mail is ' + up_mail);
  client.query('SELECT organization_name FROM organization', function(err, result) {
    if(err) {
      return console.error('i think the database is empty', err);
    }
    countJobs();
    countEvents();
    res.render('createEvents', {orgs:result.rows, noOfJobs:jobCount, noOfEvents:eventCount});
  }); 
}


function postSchoolEvents(req, res) {
  if(up_mail == undefined) {
    console.log('up mail is: ' + up_mail);
    //res.send(404);
    // countJobs();
    // countEvents();
    // res.render('index', {noOfJobs:jobCount, noOfEvents:eventCount});
    res.redirect('/login');
  }

  console.log('post an event');
  var public = req.body.inlineCheckbox1;
  console.log('checkbox is ' + public);
  timestamp = moment().format('YYYY-MM-DD[T]HH:mm:ss');
  var title = req.body.title;
  //var date = '' + req.body.selectMonth + ' ' + req.body.selectDay + ', ' + req.body.selectYear;
  //var date = '' + req.body.selectYear + '-' + req.body.selectMonth + '-' + req.body.selectDay;
  var date = req.body.date;
  var venue = req.body.venueDescription;
  var description = req.body.eventDescription;
  var p_type = 'EVENTS';
  var status = 'APPROVED';
  var e_type;
  var host = 'OSA';
  var recepient;
  var org_recepient;
  var recepients = 'Created an event for ';
  //var validDate = moment(date).isAfter(timestamp);
  //console.log('date is later than today: ' + validDate);

  if(public) {
    console.log('Checkbox is checked. It is a public event.');
    e_type = 'SCHOOL';
    recepient = 'ALL';
    recepients = recepients + 'ALL';
  } else {
    console.log('Checkbox is not checked. It is an org event.');
    e_type = 'ORG';
    org_recepient = req.body.selectOrgs,
    recepient = req.body.orgRecepient;
    recepients = recepients + org_recepient;
    org_recepient = org_recepient.toUpperCase();
  }

  client.query('SELECT organization_name from organization', function(err, results) {
    console.log('This is a ' + e_type + ' event');
    console.log('Title is ' + title);
    console.log('Date is ' + date);
    console.log('Venue is ' + venue);
    console.log('Event description: ' + description);
    console.log('Posted by: ' + up_mail);
    client.query('INSERT INTO posts(up_mail, timestamp, post, title, description, status) VALUES($1, $2, $3, $4, $5, $6)', [up_mail, timestamp, p_type, title, description, status]);
    if(public) {
      client.query('SELECT timestamp FROM posts ORDER BY timestamp DESC', function(err, result) {
        for(var i=0; i<results.rows.length; i++) {
          org_recepient = results.rows[i].organization_name;
          console.log(org_recepient);
          createEvent(timestamp, e_type, date, venue, org_recepient, host, recepient);
        }
      });
    } else {
      client.query('SELECT timestamp FROM posts ORDER BY timestamp DESC', function(err, result) {
        createEvent(timestamp, e_type, date, venue, org_recepient, host, recepient);
        recepients = recepients + org_recepient + ', ';
      });
    }
    countJobs();
    countEvents();
    res.render('createEvents', {message: recepients, orgs: results.rows, noOfJobs:jobCount, noOfEvents:eventCount});
  });
  
}

function createEvent(timestamp, e_type, date, venue, org_recepient, host, recepient) {
  client.query('INSERT INTO events(event_id, event_type, schedule, venue, org_recepient, host, recepient) VALUES($1, $2, $3, $4, $5, $6, $7)', [timestamp, e_type, date, venue, org_recepient, host, recepient], function(err, result) {
    if(err) {
      console.log('wala ka naka insert bes');
      countJobs();
      countEvents();
      res.render('createEvents', {message: "Cannot post event", orgs: result.rows, noOfJobs:jobCount, noOfEvents:eventCount});
      console.log(result);
      console.log(err);
    }
  });
}

function viewCalendar(req, res) {
  console.log('entered viewCalendar');
  if(up_mail == undefined) {
    console.log('up mail is: ' + up_mail);
    //res.send(404);
    // countJobs();
    // countEvents();
    // res.render('index', {noOfJobs:jobCount, noOfEvents:eventCount});
    res.redirect('/login');
  }
  countJobs();
  countEvents();
  res.render('calendar', {noOfJobs:jobCount, noOfEvents:eventCount});
}

function events(req, res) {

  var events = [];
  console.log('getting events');
  client.query("SELECT * from eventView", function(err, result) {
    //console.log(result.rows);
    events = result;
    // for(var i=0;i<events.rows.length;i++) {
    //   events.rows[i].id = i;
    //   events.rows[i].start = moment(events.rows[i].start).format("YYYY-MM-DD");
    //   events.rows[i].end = moment(events.rows[i].end).format("YYYY-MM-DD");
    // }
    console.log(result.rows);
    console.log(events.rows);
    res.send(events.rows);
  });
  // id, title, start, end
  // 
}

function JobReq(req, res) {  
  var feed = [];
  if(up_mail == undefined) {
    console.log('up mail is: ' + up_mail);
    //res.send(404);
    // countJobs();
    // countEvents();
    // res.render('index', {noOfJobs:jobCount, noOfEvents:eventCount});
    res.redirect('/login')
  }
  client.query('SELECT up_mail, title, timestamp, preference, requirements, details, status FROM job_hiring JOIN posts ON (job_hiring.job_id = posts.timestamp) WHERE post = $1 and status = $2', ['JOB HIRING', 'PENDING'], function(err, result) {
    if(err) {
        return console.error('error running query', err);
    }
    feed = result.rows;
    for(var i=0;i<feed.length;i++) {
      feed[i].job_id = moment(feed[i].job_id).format('YYYY-MM-DD [T] HH:mm:ss');
      feed[i].timestamp = moment(feed[i].timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
    }
    console.log('jobCount is: ' + result.rows.length);
    countJobs();
    countEvents();
    // res.redirect ('/JobReq')
    res.render('jobs', {jobs: feed, noOfJobs: result.rows.length, noOfEvents:eventCount});
  });
}

function countJobs(req, res) {
  client.query('SELECT up_mail, job_id, preference, requirements, details, status FROM job_hiring JOIN posts ON (job_hiring.job_id = posts.timestamp)  WHERE post = $1 and status = $2', ['JOB HIRING', 'PENDING'], function(err, result) {
    if(err) {
      jobCount = 0;
    } else {
      jobCount = result.rows.length;
    }
    //console.log(result.rows);
    console.log('jobCount is: ' + jobCount);
  });
}

function countEvents(req, res) {
  client.query('SELECT DISTINCT ON (event_id) event_id, event_type, schedule, venue, host, org_recepient, recepient, up_mail, timestamp, post, title, description, status FROM events JOIN posts ON (events.event_id = posts.timestamp) WHERE status = $1', ['PENDING'], function(err, result) {
    if(err) {
      eventCount = 0;
    } else {
    eventCount = result.rows.length;
    }    

    console.log('pending events are: ' + result);
  });
}

function ApprovedJob(req, res) {
  if(up_mail == undefined) {
    console.log('up mail is: ' + up_mail);
    //res.send(404);
    // countJobs();
    // countEvents();
    // res.render('index', {noOfJobs:jobCount, noOfEvents:eventCount});
    res.redirect('/login');
  }

  approvedjobs = [];
  var feed = [];
  client.query('SELECT * FROM job_hiring JOIN posts ON (job_hiring.job_id = posts.timestamp)  WHERE post = $1 and status = $2', ['JOB HIRING', 'APPROVED'], function(err, result) {
    console.log(result.rows);
    //approvedjobs = result.rows;
    feed = result.rows;
    for(var i=0;i<feed.length;i++) {
      feed[i].job_id = moment(feed[i].job_id).format('YYYY-MM-DD[T]HH:mm:ss');
      feed[i].timestamp = moment(feed[i].timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
      feed[i].deadline = moment(feed[i].deadline).format('YYYY-MM-DD[T]HH:mm:ss');      
    }
    countJobs();
    countEvents();
    res.render('ApprovedJobs', {noOfJobs:jobCount, approvedjobs:feed, noOfEvents:eventCount});
  });
  
}
function CreateJobForm (req, res) {
  countJobs();
  countEvents();
  res.render('CreateJob', {noOfJobs:jobCount, noOfEvents:eventCount});
}

function CreateJob(req, res) {
  if(up_mail == undefined) {
    console.log('up mail is: ' + up_mail);
    //res.send(404);
    // countJobs();
    // countEvents();
    // res.render('index', {noOfJobs:jobCount, noOfEvents:eventCount});
    res.redirect('/login');
  }  
  timestamp = moment().format('YYYY-MM-DD[T]HH:mm:ss');
  var title = req.body.title;
  var description = req.body.description;
  var type = 'JOB HIRING';
  var preference = req.body.preference;
  var requirements = req.body.requirements;
  var details = req.body.details;
  var jobtype = req.body.jobtype;
  var date = req.body.date;
  var company = req.body.company;

  client.query('INSERT INTO posts(up_mail, timestamp, post, title, description, status) VALUES($1, $2, $3, $4, $5, $6)', [up_mail, timestamp, type, title, description, 'APPROVED']);
  client.query('INSERT INTO job_hiring(job_id, preference, requirements, details, jobtype, deadline, company) VALUES($1, $2, $3, $4, $5, $6, $7)', [timestamp, preference, requirements, details, jobtype, date, company]);
  countJobs();
  countEvents();
  res.render('CreateJob', {message: "Posted a job for all", noOfJobs:jobCount, noOfEvents:eventCount});
}

function PendingEvents (req, res) {
  var feed = [];
  countJobs();
  countEvents();
  //client.query('SELECT DISTINCT event_id from posts natural join events where status = $1 and post = $2', ['Pending', 'Events'], function(err, result) {
  client.query('SELECT DISTINCT ON (event_id) timestamp, event_type, schedule, venue, host, org_recepient, recepient, up_mail, post, title, description, status FROM events JOIN posts ON (events.event_id = posts.timestamp) WHERE status = $1', ['PENDING'], function(err, result) {
    if(err) {
      res.render('PendingEvents', {noOfJobs:jobCount, noOfEvents:eventCount});      
    }
    console.log(result.rows);
    feed = result.rows;
    for(var i=0;i<feed.length;i++) {
      feed[i].event_id = moment(feed[i].event_id).format('YYYY-MM-DD[T]HH:mm:ss');
      feed[i].timestamp = moment(feed[i].timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
    }
    // console.log('FEEEED' + feed);
    res.render('PendingEvents', {noOfJobs:jobCount, noOfEvents:eventCount, events:feed});
  });
}



function editEvent(req, res) {
  var feed = [];
  var timestamp = moment(req.body.edit_form_timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
  var app = 'APPROVED';
  //client.query('SELECT DISTINCT event_id from posts natural join events where status = $1 and post = $2', ['Pending', 'Events'], function(err, result) {
  console.log('timestamp is ' + timestamp);
  // console.log('status is ' + req.body.status);
  // console.log('title is ' + req.body.title);
  client.query('UPDATE posts SET status = $1 WHERE timestamp = $2', [app, timestamp], function(err, result) {
    console.log(result);
  });
  rest.post('https://twaud.io/api/v1/upload.json', {
    multipart: true,
    username: 'danwrong',
    password: 'wouldntyouliketoknow',
    data: {
      'sound[message]': 'Approved event'
    }
  }).on('complete', function(data) {
    console.log(data.audio_url);
  });

  p_client.sendMessage('Approved event', function(error, response) {
   if (error) {
    console.log('Some error occurs: ', error);
   }

   console.log('Pushwoosh API response is', response);
  });
      
  res.redirect('/PendingEvents')  
  // client.query('SELECT DISTINCT ON (event_id) event_id, event_type, schedule, venue, host, org_recepient, recepient, up_mail, timestamp, post, title, description, status FROM events JOIN posts ON (events.event_id = posts.timestamp) WHERE status = $1', ['Pending'], function(err, result2) {
  //   console.log(result2.rows);
  //   feed = result2.rows;
  //   for(var i=0;i<feed.length;i++) {
  //     feed[i].event_id = moment(feed[i].event_id).format('YYYY-MM-DD[T]HH:mm:ss');
  //     feed[i].timestamp = moment(feed[i].timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
  //   }
  //   console.log('FEEEED' + feed);
  //   countJobs();
  //   countEvents();
  //   res.render('PendingEvents', {noOfJobs:jobCount, noOfEvents:eventCount, events:feed});
  // });
}

function deleteEvent(req, res) {
  var timestamp = moment(req.body.delete_form_timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
  client.query("DELETE FROM posts WHERE timestamp = $1", [timestamp]);
  res.redirect('/PendingEvents')
  // client.query('SELECT DISTINCT ON (event_id) event_id, event_type, schedule, venue, host, org_recepient, recepient, up_mail, timestamp, post, title, description, status FROM events JOIN posts ON (events.event_id = posts.timestamp) WHERE status = $1', ['Pending'], function(err, result2) {
  //   console.log(result2.rows);
  //   feed = result2.rows;
  //   for(var i=0;i<feed.length;i++) {
  //     feed[i].event_id = moment(feed[i].event_id).format('YYYY-MM-DD[T]HH:mm:ss');
  //     feed[i].timestamp = moment(feed[i].timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
  //   }
  //   console.log('FEEEED' + feed);
  //   countJobs();
  //   countEvents();
  //   res.render('PendingEvents', {noOfJobs:jobCount, noOfEvents:eventCount, events:feed});
  // });
}

function editJob(req, res) {
  var feed = [];
  var timestamp = moment(req.body.edit_form_timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
  var app = 'APPROVED';
  console.log("hoy why?!?" +timestamp);
  // client.query('UPDATE posts SET status = $1 WHERE timestamp = $2', ['Approved', timestamp], function(err, result) {
  //   console.log(result);
  // });
  //client.query('SELECT DISTINCT event_id from posts natural join events where status = $1 and post = $2', ['Pending', 'Events'], function(err, result) {
  client.query("UPDATE posts SET status = 'APPROVED' WHERE timestamp = $1", [timestamp], function(err, result) {
    console.log(result);
  });

  rest.post('https://twaud.io/api/v1/upload.json', {
    multipart: true,
    username: 'danwrong',
    password: 'wouldntyouliketoknow',
    data: {
      'sound[message]': 'Approved job!'
    }
  }).on('complete', function(data) {
    console.log(data.audio_url);
  });

  p_client.sendMessage('Approved job', function(error, response) {
   if (error) {
    console.log('Some error occurs: ', error);
   }

   console.log('Pushwoosh API response is', response);
  }); 

  // client.query('SELECT up_mail, title, job_id, preference, requirements, details, status FROM job_hiring JOIN posts ON (job_hiring.job_id = posts.timestamp) WHERE post = $1 and status = $2', ['Job Hiring', 'Pending'], function(err, result) {
  //   if(err) {
  //       return console.error('error running query', err);
  //   }
  //   console.log('jobCount is: ' + result.rows.length);
  //   feed = result.rows;
  //   for(var i=0;i<feed.length;i++) {
  //     feed[i].job_id = moment(feed[i].job_id).format('YYYY-MM-DD[T]HH:mm:ss');
  //     feed[i].timestamp = moment(feed[i].timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
  //   }
  //   countJobs();
  //   countEvents();
  //   // res.render('jobs', {jobs: feed, noOfJobs: result.rows.length, noOfEvents:eventCount});

  // });
  res.redirect('/JobReq');
}

function deleteJob(req, res) {
  var timestamp = moment(req.body.delete_form_timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
  client.query("DELETE FROM posts WHERE timestamp = $1", [timestamp]);
  console.log("timestamp bes "+timestamp)
  res.redirect('/JobReq');
  // client.query('SELECT up_mail, title, job_id, preference, requirements, details, status FROM job_hiring JOIN posts ON (job_hiring.job_id = posts.timestamp) WHERE post = $1 and status = $2', ['Job Hiring', 'Pending'], function(err, result) {
  //   if(err) {
  //       return console.error('error running query', err);
  //   }
  //   console.log('jobCount is: ' + result.rows.length);
  //   feed = result.rows;
  //   for(var i=0;i<feed.length;i++) {
  //     feed[i].job_id = moment(feed[i].job_id).format('YYYY-MM-DD[T]HH:mm:ss');
  //     feed[i].timestamp = moment(feed[i].timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
  //   }
  //   countJobs();
  //   countEvents();
  //   // res.render('jobs', {jobs: feed, noOfJobs: result.rows.length, noOfEvents:eventCount});

  // });
}

function editAnnouncement(req, res) {
  var feed = [];
  var timestamp = moment(req.body.edit_form_timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
  //client.query('SELECT DISTINCT event_id from posts natural join events where status = $1 and post = $2', ['Pending', 'Events'], function(err, result) {
  console.log('timestamp is ' + timestamp);
  console.log('description is ' + req.body.description);
  console.log('title is ' + req.body.title);
  client.query('UPDATE posts SET title = $1, description = $2 WHERE timestamp = $3', [req.body.title, req.body.description, timestamp], function(err, result) {
    console.log(result);
  });
  res.redirect('/viewAnn');  
}

function deleteAnnouncement(req, res) {
  var feed = [];
  var timestamp = moment(req.body.delete_form_timestamp).format('YYYY-MM-DD[T]HH:mm:ss');  
  // var timestamp = moment(req.body.timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
  client.query("DELETE FROM posts WHERE timestamp = $1", [timestamp]);
  
  res.redirect('/viewAnn');  
}

function editOsaJob(req, res) {
  var feed = [];
  var timestamp = moment(req.body.edit_form_timestamp).format('YYYY-MM-DD [T] HH:mm:ss');
  console.log('timestamp is ' + timestamp);
  console.log('title is ' + req.body.title);
  console.log('details is ' + req.body.details);
  console.log('preference is ' + req.body.preference);
  console.log('requirements is ' + req.body.requirements);
  ///console.log('deadline is ' + req.body.deadline);
  console.log('company is ' + req.body.company);
  client.query('UPDATE posts SET title = $1 WHERE timestamp = $2', [req.body.title, timestamp], function(err, result) {
    console.log('updating posts ' + result.rows);
  });
  client.query('UPDATE job_hiring SET preference = $1, requirements = $2, details = $3, company = $4,  WHERE job_id = $5', [req.body.preference, req.body.requirements, req.body.details, req.body.company, timestamp], function(err, result) {
    console.log('updating job_hiring ' + result.rows);
  });
  res.redirect('/ApprovedJob') ;  
}

function deleteOsaJob(req, res) {
  var feed = [];
  var timestamp = moment(req.body.delete_form_timestamp).format('YYYY-MM-DD [T] HH:mm:ss');
  console.log('deleting job with timestamp ' + timestamp);
  client.query("DELETE FROM posts WHERE timestamp = $1", [timestamp], function(err, result) {
    //console.log('deleting... ' + result);
  });
  res.redirect('/ApprovedJob') ;
  
}


function MonitorOrgs(req, res) {
  if(up_mail == undefined) {
    console.log('up mail is: ' + up_mail);
    res.redirect('/login');
  }

  var org = req.body.selectOrgs;
  var orgs = [];
  client.query('SELECT organization_name FROM organization', function(err, result) {
    orgs = result.rows;
    //console.log(orgs);
    countJobs();
    countEvents();
    res.render('orgs', {orgs: result.rows, noOfJobs:jobCount, noOfEvents:eventCount});
  });

}

function MonitorOrgs2(req, res) {
  var org = req.body.selectOrgs;
  var orgs = [];
  client.query('SELECT organization_name FROM organization', function(err, result) {
    orgs = result.rows;
    //console.log(orgs);
    countJobs();
    countEvents();
    client.query('select * from posts inner join org_post on orgpost_id = timestamp where org_name = $1 order by timestamp', [org], function(err, result2) {
      console.log('org posts for org ' + org);
      console.log(result2.rows);
      client.query('select title, description, venue, schedule, recepient, up_mail, event_type, host, timestamp, status from posts inner join events on event_id = posts.timestamp where host = $1 group by posts.timestamp,venue,recepient, up_mail, event_type, status, schedule, host, timestamp order by schedule', [org], function(err, result3) {

        console.log(result3.rows);


        res.render('orgs', {orgs: result.rows, orgevents: result3.rows, orgposts:result2.rows, noOfJobs:jobCount, noOfEvents:eventCount});
      });
    });
  });
}

function ViewEvents (req, res) {
  if(up_mail == undefined) {
    console.log('up mail is: ' + up_mail);
    res.redirect('/login');
  }


  client.query('select title, description, venue, schedule, recepient, up_mail, event_type, host, timestamp, status from posts inner join events on event_id = posts.timestamp where status = $1 group by posts.timestamp,venue,recepient, up_mail, event_type, status, schedule, host, timestamp order by schedule', ['APPROVED'], function(err, result) {
    console.log(result.rows);

    countJobs();
    countEvents();
    res.render('ViewEvents', {events: result.rows, noOfJobs:jobCount, noOfEvents:eventCount});
  });
}

function deleteOsaEvent(req, res) {
  var timestamp = moment(req.body.delete_form_timestamp).format('YYYY-MM-DD[T]HH:mm:ss');
  client.query("DELETE FROM posts WHERE timestamp = $1", [timestamp], function(err, result) {
    console.log(result);
  });
  res.redirect('/ViewEvents')
}

function editOsaEvent(req, res) {
  var feed = [];
  var timestamp = moment(req.body.edit_form_timestamp).format('YYYY-MM-DD [T] HH:mm:ss');
  var title = req.body.title;
  var description = req.body.description;
  var venue = req.body.venue;
  console.log('timestamp is ' + timestamp);
  console.log('title is ' + req.body.title);
  console.log('details is ' + req.body.description);
  console.log('venue is ' + req.body.venue);
  client.query('UPDATE posts SET title = $1, description = $2 WHERE timestamp = $3', [title, description, timestamp], function(err, result) {
    console.log('updating posts ' + result);
  });
  client.query('UPDATE events SET venue = $1,  WHERE event_id = $2', [venue, timestamp], function(err, result) {
    console.log('updating events ' + result);
  });
  res.redirect('/ViewEvents') ;   
}

         
module.exports = {
  //mobile
  getAllUsers: getAllUsers,
  postDetails: postDetails,
  orgDetails: orgDetails,
  postOrgs: postOrgs,
  OsaAnnouncement:OsaAnnouncement,
  OrgAnnouncements:OrgAnnouncements,
  jobPost:jobPost,
  eventPost:eventPost,
  HomeEvents:HomeEvents,
  OsaEvents:OsaEvents,
  OrgEvents:OrgEvents,
  getJobs: getJobs,
  getIntern:getIntern,
  timelineEvents:timelineEvents,
  allOrgs: allOrgs,
  OfficerAnnouncement: OfficerAnnouncement,
  OfficerEvents: OfficerEvents,

  //web
  get: get,
  post: post,
  prof: prof,
  announce2: announce2,
  announce: announce,
  announcements:announcements,
  getSchoolEvents: getSchoolEvents,
  postSchoolEvents: postSchoolEvents,
  viewCalendar: viewCalendar,
  events:events,
  JobReq: JobReq,
  ApprovedJob:ApprovedJob,
  CreateJob:CreateJob,
  CreateJobForm:CreateJobForm,
  PendingEvents:PendingEvents,
  editJob:editJob,
  editEvent:editEvent,
  deleteEvent:deleteEvent,
  deleteJob:deleteJob,
  editAnnouncement:editAnnouncement,
  deleteAnnouncement:deleteAnnouncement,
  editOsaJob:editOsaJob,
  deleteOsaJob:deleteOsaJob,
  MonitorOrgs:MonitorOrgs,
  MonitorOrgs2:MonitorOrgs2,
  ViewEvents:ViewEvents,
  deleteOsaEvent: deleteOsaEvent,
  editOsaEvent: editOsaEvent
};
