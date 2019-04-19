///////////////////
// Required Libs //
///////////////////
const {
    RestApp
} = require('bb-rest');

//Set required variables for authentication
var origin = 'Base URL for BlackBoard Goes Here';
var key = 'Application Key Goes Here';
var secret = 'Secret Key Goes Here';

//Initialize REST App
var rest_APP = new RestApp(origin, key, secret);

///////////////
// Functions //
///////////////

//Enter Year
const year = "2019"
//Enter Term, Spring or Fall
const term = "Spring"

//Define necessary lists for global use.
var courseIDList = [];
var courseContentList = [];
var tmp = [];
var parent = "";

function GET_Courses(callback) {
    rest_APP.get('courses?courseId=' + year + '_' + term, {
        complete: function (error, response, body) {
            // get the length of the body inside results{}
            var bodyLength = Object.keys(body.results).length;

            if (!error) {
                for (var i = bodyLength - 1; i >= 0; i--) {
                    courseIDList.push(body.results[i].id)
                }
                console.log("Course ID's: ");
                console.log(courseIDList);
                if(callback) callback();
            } else {
                console.log('error:', error);
            }
        }
    })
}

function GET_CourseContent() {
    for (let i = courseIDList.length - 1; i >= 0; i--) {
        rest_APP.get('courses/' + courseIDList[i] + '/contents', {
            data: {},
            complete: function (error, response, body) {
                if (!error) {
                    // get the length of the body inside results{}
                    parent = courseIDList[i];
                    var bodyLength2 = Object.keys(body.results).length;

                    for (var j = bodyLength2 - 1; j >= 0; j--) {
                        tmp.push(body.results[j].title)
                        for (element in tmp){
                            if (tmp.indexOf("Course Syllabus") >= 0) {
                                //Don't need to worry about it.
                            } else {
                                courseContentList.push('Parent: ' + parent)
                                courseContentList.push(body.results[j].title)
                                courseContentList.push(body.results[j].id)
                                //Place Content
                                POST_Content(parent);
                            }
                        }
                        tmp.pop();
                    }
                }
            }
        })
    }
}

//Posts a top level content item of type "resource/x-bb-folder".
function POST_Content(courseId) {
    rest_APP.post('courses/' + courseId + '/contents', {
        data: {
            title: "Course Syllabus",
            contentHandler: {
                 id: "resource/x-bb-folder"
            }
        },
        complete: function (error, response, body) {
            if(!error){
            console.log("Content Added to " + courseId)
            console.log("ID: " + body.status);
            }
        }
    })
}

//Posts  a child content item of type "resource/x-bb-document" and fills in the iframe link that requests syllabi given the course id.
function POST_Child_Content(courseID, contentID) {
    rest_APP.post('courses/' + courseID + '/contents/' + contentID + '/children', {
        data: {
            title: "Syllabus Cover Page",
            body: '<iframe width=\"1067\" height=\"800\" ' + 'src= \"LINK TO PROPRIETARY SYLLABUS GENERATOR"</iframe>',
            contentHandler: {
                id: "resource/x-bb-document"
            }
        },
        complete: function (error, response, body) {
            console.log("Content Added to course " + courseID)
        }
    })
}

function DELETE_CourseContent(){
    rest_APP.post('courses/' + courseID + '/contents/' + contentID + '/children', {
        data:{},
        complete: function (error, response, body) {
            console.log("Course Content Deleted from: " + courseID)
        }
    })
}


//Calls
//GET_Announcements();
GET_Courses(GET_CourseContent)
setTimeout(function () { console.log(courseContentList); }, 5000);


//MISC
// Gets announcements
//function GET_Announcements(){
//     rest_APP.get('announcements', {
//         complete: function(error,response,body){
//             if(!error){
//                 console.log(body.results[0]);
//             } else {
//                 console.log('Error code:' ,error);
//             }
//         }
//     })
// }
//
//
//creates a new course
// function POST_Course() {
//     rest_APP.post('courses', {
//         data: {
//             courseId: "TESTCOURSE1002",
//             name: "TestCourse3",
//             description: "A test course for rest calls, from inside the rest_test file."
//         },
//         complete: function (error, response, body) {
//             console.log("The course was created successfully.")
//         }
//     })
// }
// //changes the name of the created course
// function PATCH_Course() {
//     rest_APP.patch('courses/courseId:TESTCOURSE1002', {
//         data: {
//             name: 'Test Course 3'
//         },
//         complete: function (error, response, body) {
//             console.log("Course Name Changed")
//         }
//     })
// }