const { default: mongoose } = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
	retries: {
		type: Number,
		default: 0,
		max: 5
	},
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1h'
    }
});

// Define a function to send emails
async function sendVerificationEmail(email, otp) {
	// Send the email
	try {
		const mailResponse = await mailSender(
			email,
			"Forget Password - Sonatek Steel Inventory",
			emailTemplate(otp)
		);
		console.log("Email sent successfully: ", mailResponse.response);
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
		throw error;
	}
}

// Define a post-save hook to send email after the document has been saved
otpSchema.post("save", async function () {
	// Only send an email when a new document is created
	await sendVerificationEmail(this.email, this.otp);
});

module.exports = mongoose.model('OTP', otpSchema);