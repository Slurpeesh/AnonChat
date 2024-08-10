> [!WARNING] 
> **The initial connection may take some time.**

# Run on local machine
### Backend
First you need to go to the folder with the Backend part of the application: type `cd Backend` in terminal.
Next there are a number of commands:
- `build`: will just transpile TypeScript into JavaScript, transpiled code will be in "dist" folder;
- `npm run setup`: will start the server on port 5122;
- `npm run start`: will start the server on port 5122 with *watch-mode*.

### Frontend
First you need to go to the folder with the Frontend part of the application: type `cd Frontend` in terminal.
1. To build a project in development mode, enter in the terminal: `npm run build:dev`, the built project will appear in the "build" folder.
2. To build a project for production you should enter in the terminal: `npm run build:prod`.
3. To build a project in *watch-mode* you should enter in the terminal: `npm run start`.
4. In order to analyze the built project, you should specify the parameter in the terminal: `-- --env analyzer=true`, for example, to build and run the project in *watch-mode* you should enter: `npm run start -- --env analyzer=true`, if you do not specify the parameter, the default will be `analyzer=false`.
5. In order to start the project in *watch-mode* on a certain port, you need to specify the parameter in the terminal `-- --env port=(port number)`, for example, to build and run the project on port 5000 in *watch-mode* you need to enter: `npm run start -- --env port=5000`, if you do not specify the parameter, **the default port will be 3000**.
