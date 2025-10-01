import BaseRequest from './BaseRequest.js';

export default class RegisterRequest extends BaseRequest {
  rules() {
    return {
      name: 'required|string',
      email: 'required|string|email',
      password: 'required|string|min:6',
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


