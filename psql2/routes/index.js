var express = require('express');
var router = express.Router();

var db = require('../queries');

//mobile shit
router.get('/Musers', db.getAllUsers);
router.post('/MLogin', db.postDetails);
router.post('/myOrgs', db.orgDetails);
router.post('/postOrgs', db.postOrgs);
router.get('/OsaAnnouncement', db.OsaAnnouncement);
router.post('/OrgAnnouncements', db.OrgAnnouncements);
router.post('/jobPost', db.jobPost);
router.post('/eventPost', db.eventPost);
router.post('/HomeEvents', db.HomeEvents);
router.get('/OsaEvents', db.OsaEvents);
router.post('/OrgEvents', db.OrgEvents);
router.get('/getJobs', db.getJobs);
router.get('/getIntern', db.getIntern);
router.post('/timelineEvents', db.timelineEvents);
router.post('/allOrgs', db.allOrgs);
router.post('/OfficerEvents', db.OfficerEvents);
router.post('/OfficerAnnouncement', db.OfficerAnnouncement);
//web shit
router.get('/login', db.get);
router.get('/', db.get);
router.get('/logout', db.get);
router.post('/login', db.post);
router.get('/profile', db.prof);
router.post('/announce', db.announce);
router.get('/announce', db.announce2);
router.get('/viewAnn', db.announcements);
router.get('/createSE', db.getSchoolEvents);
router.post('/createSE', db.postSchoolEvents);
router.get('/viewCalendar', db.viewCalendar);
router.get('/events', db.events);
router.get('/JobReq', db.JobReq);
router.get('/ApprovedJob', db.ApprovedJob);
router.get('/CreateJob', db.CreateJobForm);
router.post('/CreateJob', db.CreateJob);
router.get('/PendingEvents', db.PendingEvents);
router.post('/editJob', db.editJob);
router.post('/editEvent', db.editEvent);
router.post('/deleteEvent', db.deleteEvent);
router.post('/deleteJob', db.deleteJob);
router.post('/editAnnouncement', db.editAnnouncement);
router.post('/deleteAnnouncement', db.deleteAnnouncement);
router.post('/EditOsaJob', db.editOsaJob);
router.post('/DeleteOsaJob', db.deleteOsaJob);
router.get('/Orgs', db.MonitorOrgs);
router.post('/Orgs', db.MonitorOrgs2);
router.get('/ViewEvents', db.ViewEvents);
router.post('/deleteOsaEvent', db.deleteOsaEvent);
router.post('/editOsaEvent', db.editOsaEvent);

module.exports = router;