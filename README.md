# BlackBoard Syllabus Insertion via REST API

See https://www.w3schools.com/js/default.asp for info on learning the basics of Javascript.  
https://www.npmjs.com/package/bb-rest  
https://github.com/C-Weinstein/bb-rest
***
# Requirements and Initialization
In order to import the correct library, we use a statement like the following, that both defines the name of our app and assigns a library to that name.
```javascript
const {
    RestApp
} = require('bb-rest');
```
Following this, we have a list of required variables that define the origin path, the user key, and the user secret.
```javascript
var origin = 'Base Blackboard URL';
var key = '<application key>';
var secret = '<secret key>';
```
To initalize the app, we use the following line:
```javascript
var rest_APP = new RestApp(origin, key, secret);
```

# Usage
RestApp objects have five methods corresponding to the five HTTP verbs:
1. `GET` -- Requests information from the server.
2. `POST` -- Sends information and possibly data to the server.
3. `PATCH` -- Updates records on the server (Requires an identifier of the original record to be sent along with desired changes.)
4. `PUT` -- Similair to post, but is idempotent.
5. `DELETE` -- Deletes a record from the server.

__NOTE__: Use `PUT` when you want to modify a singular resource which is already a part of resources collection, and use `POST` when you want to add a child resource under resources collection.

The syntax for initialization is:
```
myApp[method](path [string], options [object]);
```

The `path` argument finds the main API directory automatically. You only need to include the path after `/learn/api/public/v1/`.

The `options` argument takes only two properties:
1. `data`: the object to be sent with the request.
2. `complete`: the method to be performed upon the response. It follows the same syntax as the `callback` argument of the `request` module. If undefined, it logs the body to the console.
If no data is to be sent (i.e. for `GET` requests), the `options` argument can simply be replaced with the `complete` function.

An example `PATCH` request to update an existing course might look like this:

```js
myApp.patch('courses/courseId:myCourse', {
  data: {name: 'New Name', description: 'This course has been renamed.'},
  complete: function (error, response, body) {
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
  }
});
```

# Code

My overall algorithm is as follows:
1. Get a list of courses.
2. Get every `ContentID` in every course.
3. If `course` does not contain 'Course Syllabus'
   * True case: Create a folder item 'Course Syllabus' of type `` and add child content 'Syllabus Cover Page'.
   * False case: Do nothing, move on.
4. Loop until `CourseID`'s are exhausted.



## Step 1:

1. Call get function using courses url, with the year and term modifer to ensure that not all results are grabbed.
2. Store the length of the body of the result in order to iterate over it later.
3. For every element in the body, push the id field of the results into a new list 'courseIDList'.
4. When testing, output the list immediately to check for errors. No need in production.
5. Call the callback function to move on to Step 2.

```javascript
function GET_Courses(callback) {
    rest_APP.get('courses?courseId=' + year + '_' + term, {
        data: {},
        complete: function (error, response, body) {
            var bodyLength = Object.keys(body.results).length;
            if (!error) {
                for (var i = bodyLength - 1; i >= 0; i--) {
                    courseIDList.push(body.results[i].id)
                }
                if(callback) callback();
            } else {
                console.log('error:', error);
            }
        }
    })
}
```
## Step 2:

This function gets the top level content items of each course received in the `GET_Courses` function.

1. I have the `Get` method wrapped in a `for` loop because each `course` in `courseIDList` needs to be iterated over and all children in all courses have to be accounted for.
2. The body of the function is similar to `GET_courses` in that it receives a JSON list and parses out the title, parent, and id of the content item.
3. I keep track of the parents of each content item by keeping the `courseID` in the current iteration.


```javascript
function GET_CourseContent() {
    for (var i = courseIDList.length - 1; i >= 0; i--) {
        rest_APP.get('courses/' + courseIDList[i] + '/contents', {
            data: {},
            complete: function (error, response, body) {
                parent = courseIDList[i];
                if (!error) {
                    // get the length of the body inside results{}
                    var bodyLength2 = Object.keys(body.results).length;

                    for (var j = bodyLength2 - 1; j >= 0; j--) {
                        tmp.push(body.results[j].title)

                        if (tmp.indexOf("Course Syllabus") >= 0) {
                            //courseContentList.push("Success");
                        } else {
                            courseContentList.push('Parent: ' + parent);
                            courseContentList.push(body.results[j].title)
                            courseContentList.push(body.results[j].id)
                        }
                        tmp.pop();
                    }
                }
            }
        })
    }
}
```

