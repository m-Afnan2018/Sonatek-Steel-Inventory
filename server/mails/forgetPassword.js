exports.forgetPasswordMail = (otp) => {
    return `
    <h1>OTP for Password Reset</h1>
    <p>Your OTP for password reset is: <strong>${otp}</strong></p>
    <p>This OTP is valid for 1 hour. If you did not request a password reset, please ignore this email.</p>
    `
}