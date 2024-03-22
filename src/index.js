import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config({
  path: "../.env",
});

import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    
    app.on("error", (err) => {
      console.log("Error in server connection: ", err);
      throw err;
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed: ", err);
  });
