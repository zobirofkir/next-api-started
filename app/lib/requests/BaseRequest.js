export default class BaseRequest {
  constructor(req) {
    const body = req && req.body && typeof req.body === 'object' ? req.body : {};
    this.original = body;
    this.cleaned = {};
    this.errors = {};
    this.valid = false;
  }

  // Override in subclasses
  rules() {
    return {};
  }

  // Override to customize sanitization
  sanitize(values) {
    return values;
  }

  validate() {
    const rules = this.rules();
    const values = {};
    const errors = {};

    const toArray = (val) => (Array.isArray(val) ? val : String(val).split('|'));

    for (const [field, ruleString] of Object.entries(rules)) {
      const rulesList = toArray(ruleString).map(r => (typeof r === 'string' ? r.trim() : r)).filter(Boolean);
      const raw = this.original[field];
      let value = typeof raw === 'string' ? raw : raw === undefined || raw === null ? '' : raw;

      // basic built-ins similar to Laravel
      for (const rule of rulesList) {
        if (rule === 'required') {
          const empty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
          if (empty) {
            (errors[field] ||= []).push('The field is required.');
            break;
          }
        }
        if (rule === 'string' && value !== undefined && value !== null && typeof value !== 'string') {
          (errors[field] ||= []).push('The field must be a string.');
        }
        if (typeof rule === 'string' && rule.startsWith('min:')) {
          const min = Number(rule.split(':')[1]);
          const length = typeof value === 'string' ? value.length : 0;
          if (length < min) {
            (errors[field] ||= []).push(`Minimum length is ${min}.`);
          }
        }
        if (rule === 'email' && typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim().toLowerCase())) {
            (errors[field] ||= []).push('The field must be a valid email.');
          }
        }
      }

      // normalize strings
      if (typeof value === 'string') {
        value = value.trim();
      }
      values[field] = value;
    }

    const sanitized = this.sanitize(values);
    this.cleaned = sanitized;
    this.errors = errors;
    this.valid = Object.keys(errors).length === 0;
    return this;
  }

  validated() {
    return this.cleaned;
  }

  static from(req) {
    const instance = new this(req);
    return instance.validate();
  }
}


