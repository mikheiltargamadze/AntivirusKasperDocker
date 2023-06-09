
'use strict'
const express = require('express');
const fileUpload = require('express-fileupload');
const rimraf = require('rimraf');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const { exec } = require("child_process");
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});
// enable files upload
app.use(fileUpload({
    createParentPath: true
}));
//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

//start app
const port = process.env.PORT || 8080;
app.listen(port, () =>
    console.log(`App is listening on port ${port}.`)
);

//start kasper service
function startKasperService() {
    exec("/etc/init.d/kesl-supervisor start", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }

        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}
startKasperService();

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return word.toUpperCase();
    }).replace(/\s+/g, '');
}
//scan directory
function casting(output) {
    var index = output.indexOf(":");
    var property = output
        .substring(0, index)
        .replace("-", "")
        .replace("_", "")
        .replace("\r", "");

    output = output.substring(output.indexOf("\t") + 1);
    return {
        propery: camelize(property),
        value: output.substring(output.indexOf(":") + 1)
            .replace(/\s/g, '')
    }
}
function scan(res, pathDirectory) {
    var command = `kesl-control --scan-file ${pathDirectory}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        rimraf.sync(pathDirectory);
        var data = stdout.split("\n");
        //create json
        var jsonData = {};
        data.filter(x => x.includes(":")).forEach(x => {
            var r = casting(x);
            jsonData[r.propery] = parseInt(r.value)
        });
        //send Response
        res.send({
            status: true,
            message: 'Files are uploaded and scaned',
            data: jsonData
        });
    });
}
app.post('/scan', async (req, res) => {
    try {
        var currentDate = new Date();
        var folderName = currentDate.getDate() + ""
            + (currentDate.getMonth() + 1) + ""
            + currentDate.getFullYear() + ""
            + currentDate.getHours() + ""
            + currentDate.getMinutes() + ""
            + currentDate.getSeconds() + "_"
            + uuidv4();

        var pathDirectory = `/tmp/uploads/${folderName}/`;
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //loop all files
            if (req.files.files.length === undefined) {
                req.files.files = [req.files.files];
            }
            _.forEach(_.keysIn(req.files.files), (key) => {
                let file = req.files.files[key];
                //move file to uploads directory
                file.mv(pathDirectory + file.name);
            });
            scan(res, pathDirectory);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
