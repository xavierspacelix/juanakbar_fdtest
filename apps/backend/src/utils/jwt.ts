import jwt from "jsonwebtoken";
export const signAccessToken = (userId: number) => {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_ACCESS_SECRET!, { expiresIn: "15m" });
};
export const signRefreshToken = (userId: number) => {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
};
export const verifyAccessToken = (token: string) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
