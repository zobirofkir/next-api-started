import BaseRequest from './BaseRequest.js';

export default class UpdateMeRequest extends BaseRequest {
  rules() {
    return {
      name: 'string',
      email: 'string|email',
      password: 'string|min:6',
    };
  }

  sanitize(values) {
    const cleaned = {};
    if (typeof values.name === 'string' && values.name.trim() !== '') {
      cleaned.name = values.name.trim();
    }
    if (typeof values.email === 'string' && values.email.trim() !== '') {
      cleaned.email = values.email.toLowerCase().trim();
    }
    if (typeof values.password === 'string' && values.password !== '') {
      cleaned.password = values.password;
    }
    return cleaned;
  }
}


