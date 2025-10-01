import BaseRequest from './BaseRequest.js';

export default class GmailAuthRequest extends BaseRequest {
  rules() {
    return {
      idToken: ['required', 'string'],
    };
  }

  sanitize(values) {
    return {
      idToken: values.idToken?.trim(),
    };
  }
}


