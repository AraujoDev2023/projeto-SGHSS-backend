import jwt from "jsonwebtoken";


const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || "60m";
const JWT_SECRET = process.env.JWT_SECRET;

export function generateAccessToken(user) {
  // payload id e tipo de usuário
  return jwt.sign(
    { id: user.userId, email: user.email, typeUser: user.typeUser },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}


