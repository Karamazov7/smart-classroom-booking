import * as authService from "../services/authService.js";

export const register = async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ message: "Registration successful", user });
};

export const login = async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
