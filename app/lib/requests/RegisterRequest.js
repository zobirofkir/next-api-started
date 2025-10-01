import BaseRequest from './BaseRequest.js';

export default class RegisterRequest extends BaseRequest {
  rules() {
    return {
      name: 'required|string',
      email: 'required|string|email',
      password: 'required|string|min:6',
    };
  }

  messages() {
    return {
      'name.required': 'Full name is required',
      'name.string': 'Name must be a valid string',
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
      name: typeof values.name === 'string' ? values.name : '',
      email: typeof values.email === 'string' ? values.email.toLowerCase() : '',
      password: typeof values.password === 'string' ? values.password : '',
    };
  }
}


