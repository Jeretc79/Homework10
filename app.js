const Employee = require("./lib/Employee");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const Manager = require("./lib/Manager");
const inquirer = require("inquirer");
const questions = require("./lib/Questions");
const cheerio = require('cheerio');
const fs = require('fs');
const util = require("util");

let writefileAsync = util.promisify(fs.writeFile);
let readFileAsync = util.promisify(fs.readFile);
let teamName;
let objToHTML = [];
let i = 0;
let member;



init();

function init() {
    inquirer.prompt(questions.initQuestions).then(function(res) {
        if (res.start) buildTeamLead();
        else init();
    });
}


function buildTeamLead() {
    inquirer.prompt(questions.managerQuestions)
        .then(function(data) {
            teamName = data.teamName;
            let tempObj = new Manager(data.manager, data.managerID, data.managerEmail, data.managerOffice);
            objToHTML.push(tempObj);
            buildStaff();
        }, function(error) {
            console.log(error);
        })
}


function buildStaff() {
    inquirer.prompt(questions.pickStaffQuestions)
        .then(function(ans) {
            switch (ans.pick) {
                case "Engineer":
                    buildEngineer();
                    break;
                case "Intern":
                    buildIntern();
                    break;
                default:
                    buildHTML();
                    break;
            }
        }, function(error) {
            console.log(error);
        })
}


function buildEngineer() {
    inquirer.prompt(questions.engineerQuestions)
        .then(function(data) {
            let tempObj = new Engineer(data.engineer, data.engineerID, data.engineerEmail, data.engineerGithub);
            objToHTML.push(tempObj);
            buildStaff();
        }, function(error) {
            console.log(error);
        })
}


function buildIntern() {
    inquirer.prompt(questions.internQuestions)
        .then(function(data) {
            let tempObj = new Intern(data.intern, data.internID, data.internEmail, data.internSchool);
            objToHTML.push(tempObj);
            buildStaff();
        }, function(error) {
            console.log(error);
        })
}



function buildHTML() {
    let html = fs.readFileSync("./templates/main.html", "utf8");
    let $main = cheerio.load(html);
    $main("#addMember").html("");
    $main("#title").html(teamName);
    writefileAsync("./templates/main.html", $main.html())
        .then(function() {
            console.log("Team Name is added to main.html successfully!!!");
            addMemberHTML();
        }, function(error) {
            console.log(error);
        });
}


function addMemberHTML() {
    if (i < objToHTML.length) {
        member = objToHTML[i++];
        if (member.getRole() === "Manager") addManager(member);
        else if (member.getRole() === "Engineer") addEngineer(member);
        else addIntern(member);
    } else {
        let html = fs.readFileSync("./templates/main.html", "utf8");
        writefileAsync(`./output/${teamName}_Team.html`, html)
            .then(function() {
                console.log(teamName + " team is built successfully!!!");
                readFileAsync("./templates/main.html", "utf8")
                    .then(async function(html) {
                        let $main = cheerio.load(html);
                        $main("#addMember").html("");
                        writefileAsync("./templates/main.html", $main.html());
                    });
            }, function(error) {
                if (error) throw error;
            });
    }
}


function addManager(member) {
    let html = fs.readFileSync("./templates/manager.html", "utf8");
    let $manager = cheerio.load(html);
    readFileAsync("./templates/main.html", "utf8")
        .then(function(data) {
            let $main = cheerio.load(data);
            $manager("#name").html(member.getName());
            $manager("#id").html(member.getId());
            $manager("#email").attr('href', `mailto:${member.getEmail()}`);
            $manager("#email").html(member.getEmail());
            $manager("#office").html(member.getOfficeNumber());
            $main("#addMember").append($manager.html());
            writefileAsync("./templates/main.html", $main.html())
                .then(function() {
                    console.log("Manager is added to main.html successfully!!!");
                    addMemberHTML();

                }, function(error) {
                    console.log(error);
                });
        });
}

//add Engineer html//
function addEngineer(member) {
    let html = fs.readFileSync("./templates/engineer.html", "utf8");
    let $engineer = cheerio.load(html);
    readFileAsync("./templates/main.html", "utf8")
        .then(function(data) {
            let $main = cheerio.load(data);
            $engineer("#name").html(member.getName());
            $engineer("#id").html(member.getId());
            $engineer("#email").attr('href', `mailto:${member.getEmail()}`);
            $engineer("#email").html(member.getEmail());
            $engineer("#github").attr('href', `https://github.com/${member.getGithub()}`);
            $engineer("#github").html(member.getGithub());
            $main("#addMember").append($engineer.html());
            writefileAsync("./templates/main.html", $main.html())
                .then(function() {
                    console.log("Engineer is added to main.html successfully!!!");
                    addMemberHTML();

                }, function(error) {
                    console.log(error);
                });
        });
}


function addIntern(member) {
    let html = fs.readFileSync("./templates/intern.html", "utf8");
    let $intern = cheerio.load(html);
    readFileAsync("./templates/main.html", "utf8")
        .then(function(data) {
            let $main = cheerio.load(data);
            $intern("#name").html(member.getName());
            $intern("#id").html(member.getId());
            $intern("#email").attr('href', `mailto:${member.getEmail()}`);
            $intern("#email").html(member.getEmail());
            $intern("#school").html(member.getSchool());
            $main("#addMember").append($intern.html());
            writefileAsync("./templates/main.html", $main.html())
                .then(function() {
                    console.log("Intern is added to main.html successfully!!!");
                    addMemberHTML();
                }, function(error) {
                    console.log(error);
                });
        });
}