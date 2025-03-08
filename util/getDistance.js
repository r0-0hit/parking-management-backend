// function getDistance(lat1, lon1, lat2, lon2) {
// 	const R = 6371 // Earth's radius in km
// 	const dLat = ((lat2 - lat1) * Math.PI) / 180
// 	const dLon = ((lon2 - lon1) * Math.PI) / 180
// 	const a =
// 		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
// 		Math.cos((lat1 * Math.PI) / 180) *
// 			Math.cos((lat2 * Math.PI) / 180) *
// 			Math.sin(dLon / 2) *
// 			Math.sin(dLon / 2)
// 	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
// 	return R * c // Distance in km
// }

function getDistance(lat1, lon1, lat2, lon2) {
	// Convert latitude and longitude from degrees to radians
	const phi1 = (lat1 * Math.PI) / 180
	const phi2 = (lat2 * Math.PI) / 180
	const lambda1 = (lon1 * Math.PI) / 180
	const lambda2 = (lon2 * Math.PI) / 180

	// WGS-84 ellipsoid parameters
	const a = 6378137.0 // equatorial radius in meters
	const f = 1 / 298.257223563 // flattening
	const b = a * (1 - f) // polar radius

	// Calculate the reduced latitudes
	const U1 = Math.atan((1 - f) * Math.tan(phi1))
	const U2 = Math.atan((1 - f) * Math.tan(phi2))

	const sinU1 = Math.sin(U1)
	const cosU1 = Math.cos(U1)
	const sinU2 = Math.sin(U2)
	const cosU2 = Math.cos(U2)

	const L = lambda2 - lambda1

	// Initialize variables for iteration
	let lambda = L
	let sinLambda, cosLambda, sinSigma, cosSigma, sigma, sinAlpha, cos2Alpha, cos2SigmaM
	let lambdaP,
		iterations = 0

	// Iterate until convergence or max iterations reached
	do {
		sinLambda = Math.sin(lambda)
		cosLambda = Math.cos(lambda)

		sinSigma = Math.sqrt(
			Math.pow(cosU2 * sinLambda, 2) + Math.pow(cosU1 * sinU2 - sinU1 * cosU2 * cosLambda, 2)
		)

		// If points are antipodal, return direct distance through Earth's center
		if (sinSigma === 0) return 0

		cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda
		sigma = Math.atan2(sinSigma, cosSigma)
		sinAlpha = (cosU1 * cosU2 * sinLambda) / sinSigma
		cos2Alpha = 1 - sinAlpha * sinAlpha

		// Handle the case where points are on the equator
		if (cos2Alpha === 0) {
			cos2SigmaM = 0
		} else {
			cos2SigmaM = cosSigma - (2 * sinU1 * sinU2) / cos2Alpha
		}

		const C = (f / 16) * cos2Alpha * (4 + f * (4 - 3 * cos2Alpha))
		lambdaP = lambda
		lambda =
			L +
			(1 - C) *
				f *
				sinAlpha *
				(sigma +
					C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * Math.pow(cos2SigmaM, 2))))

		iterations++
	} while (Math.abs(lambda - lambdaP) > 1e-12 && iterations < 100)

	// If algorithm didn't converge, return approximate distance
	if (iterations >= 100) {
		console.warn("Vincenty formula didn't converge. Returning approximate distance.")
		// Fall back to haversine
		return getHaversineDistance(lat1, lon1, lat2, lon2)
	}

	// Calculate the ellipsoidal distance
	const uSq = (cos2Alpha * (a * a - b * b)) / (b * b)
	const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)))
	const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)))

	const deltaSigma =
		B *
		sinSigma *
		(cos2SigmaM +
			(B / 4) *
				(cosSigma * (-1 + 2 * Math.pow(cos2SigmaM, 2)) -
					(B / 6) *
						cos2SigmaM *
						(-3 + 4 * Math.pow(sinSigma, 2)) *
						(-3 + 4 * Math.pow(cos2SigmaM, 2))))

	const distance = b * A * (sigma - deltaSigma)

	// Return distance in kilometers
	return distance / 1000
}

// Fallback haversine formula for when Vincenty doesn't converge
function getHaversineDistance(lat1, lon1, lat2, lon2) {
	const R = 6371 // Earth's mean radius in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180
	const dLon = ((lon2 - lon1) * Math.PI) / 180

	// Convert to radians
	const phi1 = (lat1 * Math.PI) / 180
	const phi2 = (lat2 * Math.PI) / 180

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return R * c
}

module.exports = getDistance
