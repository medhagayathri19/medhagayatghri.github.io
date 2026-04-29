import XLSX from "xlsx";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import connectDB from "./config/db.js";

connectDB();

const workbook = XLSX.readFile("projectalumni.csv");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const importData = async () => {
  try {

    const users = await Promise.all(
      data.map(async (row) => {

        const hashedPassword = await bcrypt.hash(
          row.Registration_number.toString(),
          10
        );

        return {

          name: row.Name_of_the_Alumni,

          reg_no: row.Registration_number,

          phone: row.Mobile_number,

          email: row.Email_ID,

          address: row.Workplace,

          status: "working",

          department: row.Department_name,

          passout_year: row.Year_of_pass_out,

          company: row.Company_Working_at_present_or_Enterpreneur,

          job_role: row.Designation,

          password: hashedPassword

        };

      })
    );

    await User.insertMany(users);

    console.log("Excel Data Imported Successfully");

    process.exit();

  } catch (error) {

    console.error(error);
    process.exit(1);

  }
};

importData();