import "dotenv/config";


import connectDB from "./config/database.js";
import app from "./app.js"


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    app.listen(PORT, (req, res) => {
      console.log(`Server is running on PORT http://localhost:${PORT}`);
    });
    await connectDB();
  } catch (error){
    console.log("Server failed to start : ",  error.message);
    process.exit(1);
  }
};

startServer();
