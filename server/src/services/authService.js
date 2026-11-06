import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

const SALT_ROUNDS = 12;
// Used so a login for an unknown email takes about as long as a real one
const DUMMY_HASH = bcrypt.hashSync("dummy-password", SALT_ROUNDS);

export const toPublicUser = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

export async function register({
  collegeId,
  name,
  email,
  password,
  role,
  department,
}) {
  const domain = process.env.ALLOWED_EMAIL_DOMAIN || "nitc.ac.in";
  if (!email.endsWith(`@${domain}`)) {
    throw new AppError(400, `Please use your institutional email (@${domain})`);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: { collegeId, name, email, passwordHash, role, department },
    });
    return toPublicUser(user);
  } catch (err) {
    if (err.code === "P2002") {
      // unique constraint violation (email or collegeId)
      throw new AppError(409, "Email or college ID is already registered");
    }
    throw err;
  }
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  const passwordOk = await bcrypt.compare(
    password,
    user ? user.passwordHash : DUMMY_HASH,
  );

  // One generic message, so attackers can't tell which emails exist
  if (!user || !passwordOk || !user.isActive) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

  return { token, user: toPublicUser(user) };
}
