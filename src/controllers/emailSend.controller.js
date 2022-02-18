const nodemailer = require('nodemailer');


 const transporter = nodemailer.createTransport({

	host: "smtp.gmail.com",
	    port: 465,
		secure: true,
	    auth: {
	      user: "HenryVerse2022@gmail.com",
	      pass: "jwhzepkkoyoenagh"
	    }
	});
transporter.verify().then(()=>{
    console.log('ready for send emails')
})

	

    module.exports={transporter}