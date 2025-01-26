const nodemailer = require('nodemailer')

const sendEmailNotification = (userEmail, context, info) => {
	// Create a transporter object using SMTP transport
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		secure: true,
		port: 456,
		auth: {
			user: '20monarch03@gmail.com', // Replace with your email
			pass: 'gqbgclhqxtwjlzmm', // Replace with your email password
		},
	})

	const message = {
		subject: '',
		text: '',
	}

	switch (context) {
		case 'userPending':
			message.subject = 'Booking is Pending'
			message.text =
				'Your booking has been created and is currently pending. We will notify you once the payment is confirmed.'
			break

		case 'managerPending':
			message.subject = 'New Booking'
			message.text =
				'Your parking spot has been booked and payment has been done. Check the payment status and aprove or reject the booking.'
			break

		case 'userConfirmed':
			message.subject = 'Booking has been Confirmed'
			message.text = `Booking for the parking slot: ${
				info.parking_spot_id.name
			} has been confirmed.\n
            ---INFO---\n
            Slot Name: ${info.parking_spot_id.name}\n
            Date: ${new Date(info.booking_date).toLocaleDateString()}\n
            Time: ${new Date(info.start_time).toLocaleTimeString()} - ${new Date(
				info.end_time
			).toLocaleTimeString()}\n
            Amount: ${info.total_cost}\n
            Status: ${info.status}\n
            Transaction ID: ${info.transactionId}`
			break
		case 'userRejected':
			message.subject = 'Booking has been Rejected'
			message.text = `Booking for the parking slot: ${
				info.parking_spot_id.name
			} has been rejected.\n
            ---INFO---\n
            Slot Name: ${info.parking_spot_id.name}\n
            Date: ${new Date(info.booking_date).toLocaleDateString()}\n
            Time: ${new Date(info.start_time).toLocaleTimeString()} - ${new Date(
				info.end_time
			).toLocaleTimeString()}\n
            `
			break
	}

	const mailOptions = {
		from: '20monarch03@gmail.com',
		to: userEmail,
		subject: message.subject,
		text: message.text,
	}

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log('Error sending email:', error)
		} else {
			console.log('Email sent: ' + info.response)
		}
	})
}

module.exports = sendEmailNotification
