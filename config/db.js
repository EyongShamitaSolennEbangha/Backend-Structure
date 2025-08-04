import mongoose, { connect } from 'mongoose'


const connectDB =  async()=>{
    connect("mongodb://localhost:27017/ModelDataBase").then(() => {
    console.log("DataBase Connected");
  })
  .catch(() => {
    console.log("Failed to Connect DataBase");
  });
}

export default connectDB