import BaseRequest from './BaseRequest.js';

export default class AuthGmailRequest extends BaseRequest {
  rules() {
    return {
      idToken: 'required|string',
      accessToken: 'required|string'
    };
  }

  messages() {
    return {
      'idToken.required': 'ID token is required',
      'accessToken.required': 'Access token is required'
    };
  }

  sanitize(values) {
    return {
      idToken: values.idToken,
      accessToken: values.accessToken
    };
  }
}


