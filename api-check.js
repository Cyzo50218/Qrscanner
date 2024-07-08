// check-auth.js

module.exports = async (req, res) => {
  const { secretKey } = req.query; // Assuming secretKey is passed as a query parameter

  // Validate secretKey (you should use a secure comparison method)
  if (secretKey !== process.env.SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // User is authenticated, serve the requested file
  res.sendFile(`${__dirname}/App.js`);
};
