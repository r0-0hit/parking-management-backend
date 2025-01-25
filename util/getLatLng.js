const axios = require('axios')

async function getLatLng(address) {
	const apiKey = 'b80cdd89c4f1452cba502c8ed892589f' // Replace with your OpenCage API key
	const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
		address
	)}&key=${apiKey}`

	try {
		const response = await axios.get(url)
		return response.data.results[0].geometry
	} catch (error) {
		console.error('Request failed:', error)
	}
}

module.exports = getLatLng
