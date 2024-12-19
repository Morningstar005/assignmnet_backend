const jwt = require('jsonwebtoken');
require('dotenv').config()


const generateAccessAndRefreshTokens = async (userId,name) => {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  
    const accessToken = jwt.sign(
      { userId,name }, 
      accessTokenSecret, 
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // Access token expires in 15 minutes
    );
  
    const refreshToken = jwt.sign(
      { userId },
      refreshTokenSecret,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // Refresh token expires in 7 days
    );
  
    return { accessToken, refreshToken };
  };
  
  module.exports = generateAccessAndRefreshTokens;