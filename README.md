# MongoDB Front End

### Before you start

This project is the front end version of our mongodb products project.  
For this to work you will have to also have a server running and have it connected to [mongodb](https://www.mongodb.com/).  
The repo for our server is located here [mongoDBServer](https://github.com/19WDWU02/mongoDBServer).  

## Installation
To install everything needed for this project you need to have a stable version of Node JS and NPM installed on your computer or server.

### Clone and Install the node modules project
```sh
$ git clone https://github.com/19WDWU02/MongoDB-Front-End.git
$ cd MongoDB-Front-End
$ npm install
```
You also need to create a **config.json** file and include the following lines.  
The url and port need to be the once used to run your node server

```json
{
  "SERVER_URL": "",
  "SERVER_PORT": ""
}
```
