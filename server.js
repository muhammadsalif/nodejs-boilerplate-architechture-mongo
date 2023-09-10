const { PORT } = require("./config/environment/index");
const app = require("./app");
const db = require("./db/index"); // for register to connect db (working without it)

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log(err);
  console.log("UNHANDLED Exception.. SHUTTING DOWN");
  process.exit(1); //1 MEANS REJECTION
});

const port = PORT || 3000;
const server = app.listen(port, () => {
  console.log(`listening to port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION.. SHUTTING DOWN");
  server.close(() => {
    //we're giving server a time to finish it process that are still pending
    process.exit(1); //1 MEANS REJECTION
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECIEVED.. SHUTTING DOWN");
  server.close(() => {
    //Sigterm itself cause the server shutDown
    console.log("Process Terminated");
  });
});
