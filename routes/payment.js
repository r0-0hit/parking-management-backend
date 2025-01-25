const express = require('express')
const { verifyToken } = require('../middleware/authMiddleware')
const { createHash } = require('node:crypto')
const axios = require('axios')
const router = express.Router()

const salt_key = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'
const merchant_id = 'PGTESTPAYUAT'

router.post('/', async (req, res) => {
	const { merchantUserId, amount, transactionId } = req.body

	try {
		const data = {
			merchantId: merchant_id,
			merchantTransactionId: transactionId,
			merchantUserId,
			amount: amount * 100,
			redirectUrl: `http://localhost:5000/api/payment/status?id=${transactionId}`,
			redirectMode: 'POST',
			callbackUrl: 'http://localhost:5000/api/payment/callback',
			paymentInstrument: {
				type: 'PAY_PAGE',
			},
		}
		const payload = JSON.stringify(data)
		const payloadMain = Buffer.from(payload).toString('base64')
		const keyIndex = 1

		const string = payloadMain + '/pg/v1/pay' + salt_key

		const sha256 = createHash('sha256').update(string).digest('hex')
		const checkSum = sha256 + '###' + keyIndex

		//testing url
		const url = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay'
		// const url = 'https://api.phonepe.com/apis/hermes/pg/v1/pay'

		const options = {
			method: 'POST',
			url: url,
			headers: {
				accept: 'application/json',
				'X-VERIFY': checkSum,
				'Content-Type': 'application/json',
			},
			data: {
				request: payloadMain,
			},
		}

		await axios(options)
			.then(result => {
				// console.log(result.data)
				return res.json(result.data)
			})
			.catch(err => {
				// console.log(err.data)
				return res.json(err)
			})

		// const response = await axios.post(
		// 	url,
		// 	{
		// 		request: payloadMain,
		// 	},
		// 	{
		// 		headers: {
		// 			Accept: 'application/json',
		// 			'X-VERIFY': checkSum,
		// 			'Content-Type': 'application/json',
		// 		},
		// 	}
		// )
		// res.status(200).json(response.data)
	} catch (error) {
		console.error(error.message)
		res.status(400).json({ message: 'Something went wrong', error: error.message })
	}
})

router.post('/callback', async (req, res) => {
	console.log(req.body)
})

module.exports = router
