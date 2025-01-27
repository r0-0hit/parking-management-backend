const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
	const authHeader = req.header('Authorization')
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		return res.status(401).json({ message: 'Access Denied' })
	}

	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET)
		req.user = verified // Attach user payload to the request object
		next()
	} catch (error) {
		res.status(400).json({ message: 'Invalid Token' })
	}
}

const isManager = (req, res, next) => {
	if (req.user && req.user.role === 'manager') {
		next()
	} else {
		res.status(403).json({ message: 'Access Denied: Managers Only' })
	}
}

// for admin 
const isAdmin = (req, res, next) => {
	if (req.user && req.user.role === 'admin') {
		next()
	} else {
		res.status(403).json({ message: 'Access Denied : Admin Only' })
	}
}

module.exports = { verifyToken, isManager, isAdmin }
