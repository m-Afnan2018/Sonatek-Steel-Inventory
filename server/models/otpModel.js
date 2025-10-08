const { default: mongoose } = require("mongoose");
const sendMail = require("../utils/mailSender");
const { forgetPasswordMail } = require("../mails/forgetPassword");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
	sendRetries: {
		type: Number,
		default: 1,
		max: 5
	},
	checkRetries: {
		type: Number,
		default: 1,
		max: 5
	},
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '15m'
    }
});

// Define a function to send emails
async function sendVerificationEmail(email, otp) {
	// Send the email
	try {
		const mailResponse = await sendMail(
			email,
			"Forget Password - Sonatek Steel Inventory",
			forgetPasswordMail(otp)
		);
	} catch (error) {
		throw error;
	}
}

// Define a post-save hook to send email after the document has been saved
otpSchema.post("save", async function () {
	// Only send an email when a new document is created
	await sendVerificationEmail(this.email, this.otp);
});

module.exports = mongoose.model('OTP', otpSchema);