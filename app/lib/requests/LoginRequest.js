import BaseRequest from './BaseRequest.js';

export default class LoginRequest extends BaseRequest {
  rules() {
    return {
      email: 'required|string|email',
      password: 'required|string|min:6',
    };
  }

  messages() {
    return {
      'email.required': 'Email address is required',
      'email.string': 'Email must be a valid string',
      'email.email': 'Please enter a valid email address',
      'password.required': 'Password is required',
      'password.string': 'Password must be a valid string',
      'password.min': 'Password must be at least 6 characters long'
    };
  }

  sanitize(values) {
    return {
      email: typeof values.email === 'string' ? values.email.toLowerCase() : '',
      password: typeof values.password === 'string' ? values.password : '',
    };
  }
}


