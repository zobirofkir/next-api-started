import BaseRequest from './BaseRequest.js';

export default class ResetPasswordRequest extends BaseRequest {
  rules() {
    return {
      email: 'required|email',
      token: 'required|string',
      password: 'required|string|min:8|confirmed',
      password_confirmation: 'required|string|min:8'
    };
  }

  messages() {
    return {
      'email.required': 'Email is required',
      'email.email': 'Please provide a valid email address',
      'token.required': 'Token is required',
      'password.required': 'Password is required',
      'password.min': 'Password must be at least 8 characters',
      'password_confirmation.required': 'Please confirm your password',
      'password.confirmed': 'Passwords do not match'
    };
  }

  sanitize(values) {
    return {
      email: String(values.email || '').trim().toLowerCase(),
      token: String(values.token || '').trim(),
      password: String(values.password || '').trim(),
      password_confirmation: String(values.password_confirmation || '').trim()
    };
  }
}
