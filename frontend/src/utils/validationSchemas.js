import * as yup from 'yup';

// Common validation messages
const messages = {
  required: (field) => `${field} is required`,
  email: 'Please enter a valid email address',
  minLength: (field, min) => `${field} must be at least ${min} characters`,
  maxLength: (field, max) => `${field} must be less than ${max} characters`,
  passwordMatch: 'Passwords do not match',
  phone: 'Please enter a valid phone number',
  postalCode: 'Please enter a valid postal code',
};

// Registration schema
export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required(messages.required('Name'))
    .min(2, messages.minLength('Name', 2))
    .max(50, messages.maxLength('Name', 50)),
  email: yup
    .string()
    .required(messages.required('Email'))
    .email(messages.email),
  password: yup
    .string()
    .required(messages.required('Password'))
    .min(6, messages.minLength('Password', 6))
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .required(messages.required('Confirm password'))
    .oneOf([yup.ref('password')], messages.passwordMatch),
});

// Login schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required(messages.required('Email'))
    .email(messages.email),
  password: yup
    .string()
    .required(messages.required('Password')),
});

// Forgot password schema
export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required(messages.required('Email'))
    .email(messages.email),
});

// Reset password schema
export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required(messages.required('Password'))
    .min(6, messages.minLength('Password', 6)),
  confirmPassword: yup
    .string()
    .required(messages.required('Confirm password'))
    .oneOf([yup.ref('password')], messages.passwordMatch),
});

// Change password schema
export const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required(messages.required('Current password')),
  newPassword: yup
    .string()
    .required(messages.required('New password'))
    .min(6, messages.minLength('New password', 6))
    .notOneOf([yup.ref('currentPassword')], 'New password must be different from current password'),
  confirmPassword: yup
    .string()
    .required(messages.required('Confirm password'))
    .oneOf([yup.ref('newPassword')], messages.passwordMatch),
});

// Profile update schema
export const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required(messages.required('Name'))
    .min(2, messages.minLength('Name', 2))
    .max(50, messages.maxLength('Name', 50)),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]*$/, messages.phone),
});

// Address schema
export const addressSchema = yup.object().shape({
  label: yup.string().max(20, messages.maxLength('Label', 20)),
  firstName: yup
    .string()
    .required(messages.required('First name'))
    .min(2, messages.minLength('First name', 2)),
  lastName: yup
    .string()
    .required(messages.required('Last name'))
    .min(2, messages.minLength('Last name', 2)),
  phone: yup
    .string()
    .required(messages.required('Phone'))
    .matches(/^[0-9+\-\s()]+$/, messages.phone),
  address: yup
    .string()
    .required(messages.required('Address'))
    .min(10, messages.minLength('Address', 10)),
  city: yup
    .string()
    .required(messages.required('City')),
  state: yup.string(),
  postalCode: yup
    .string()
    .required(messages.required('Postal code'))
    .matches(/^[0-9]{5}$/, messages.postalCode),
  country: yup.string().default('Thailand'),
});

// Review schema
export const reviewSchema = yup.object().shape({
  rating: yup
    .number()
    .required('Please select a rating')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  title: yup
    .string()
    .max(100, messages.maxLength('Title', 100)),
  comment: yup
    .string()
    .required(messages.required('Review comment'))
    .min(10, messages.minLength('Comment', 10))
    .max(1000, messages.maxLength('Comment', 1000)),
});

// Checkout schema
export const checkoutSchema = yup.object().shape({
  firstName: yup
    .string()
    .required(messages.required('First name')),
  lastName: yup
    .string()
    .required(messages.required('Last name')),
  email: yup
    .string()
    .required(messages.required('Email'))
    .email(messages.email),
  phone: yup
    .string()
    .required(messages.required('Phone'))
    .matches(/^[0-9+\-\s()]+$/, messages.phone),
  address: yup
    .string()
    .required(messages.required('Address')),
  city: yup
    .string()
    .required(messages.required('City')),
  postalCode: yup
    .string()
    .required(messages.required('Postal code'))
    .matches(/^[0-9]{5}$/, messages.postalCode),
});

export default {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  profileSchema,
  addressSchema,
  reviewSchema,
  checkoutSchema,
};
