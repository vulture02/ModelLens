export const validateRegister = (
  name: string,
  email: string,
  password: string
) => {
  const errors: Record<string, string> = {}

  if (!name.trim()) errors.name = "Name is required"
  if (!email.trim()) errors.email = "Email is required"
  if (!password) errors.password = "Password is required"
  if (password.length < 6)
    errors.password = "Password must be at least 6 characters"

  return errors
}
