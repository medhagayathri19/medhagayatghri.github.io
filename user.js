import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  S_No: Number,

  Name_of_the_Alumni: String,

  Registration_number: {
    type: String,
    unique: true
  },

  Mobile_number: String,

  Department_name: String,

  Year_of_pass_out: Number,

  Company_Working_at_present_or_Enterpreneur: String,

  Designation: String,

  Email_ID: String,

  Workplace: String,

  password: String

});

export default mongoose.model("User", userSchema);