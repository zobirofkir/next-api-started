import BaseRequest from './BaseRequest.js';

export default class LoginRequest extends BaseRequest {
  rules() {
    return {
      email: 'required|string|email',
      password: 'required|string|min:6',
    };
  }

  sanitize(values) {
    return {
      email: typeof values.email === 'string' ? values.email.toLowerCase() : '',
      password: typeof values.password === 'string' ? values.password : '',
    };
  }
}


