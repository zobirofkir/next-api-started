export default class BaseRequest {
  constructor(req) {
    console.log('BaseRequest constructor - input req:', JSON.stringify(req, null, 2));
    const body = req && typeof req === 'object' ? (req.body || req) : {};
    console.log('BaseRequest constructor - parsed body:', JSON.stringify(body, null, 2));
    
    this.original = body;
    this.cleaned = {};
    this.errors = {};
    this.valid = false;
    
    console.log('BaseRequest initialized:', {
      original: this.original,
      cleaned: this.cleaned,
      errors: this.errors,
      valid: this.valid
    });
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
    console.log('Starting validation with rules and data:', {
      rules: this.rules(),
      originalData: this.original
    });
    
    const rules = this.rules();
    const values = {};
    const errors = {};

    const toArray = (val) => {
      const result = Array.isArray(val) ? val : String(val).split('|');
      console.log(`Converted ${JSON.stringify(val)} to array:`, result);
      return result;
    };

    console.log('Processing validation rules...');
    for (const [field, ruleString] of Object.entries(rules)) {
      console.log(`\nValidating field: ${field}`);
      console.log(`Rule string: ${ruleString}`);
      
      const rulesList = toArray(ruleString).map(r => (typeof r === 'string' ? r.trim() : r)).filter(Boolean);
      console.log(`Rules list for ${field}:`, rulesList);
      
      const raw = this.original[field];
      console.log(`Raw value for ${field}:`, raw);
      
      let value = typeof raw === 'string' ? raw : raw === undefined || raw === null ? '' : raw;
      console.log(`Processed value for ${field}:`, value);

      // basic built-ins similar to Laravel
      for (const rule of rulesList) {
        console.log(`  Applying rule '${rule}' to ${field}`);
        
        if (rule === 'required') {
          const empty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
          console.log(`  Required check for ${field}:`, { value, empty });
          
          if (empty) {
            const errorMsg = `${field} is required.`;
            console.log(`  Validation failed: ${errorMsg}`);
            (errors[field] ||= []).push(errorMsg);
            break;
          }
        }
        
        if (rule === 'string' && value !== undefined && value !== null && typeof value !== 'string') {
          const errorMsg = `${field} must be a string.`;
          console.log(`  Validation failed: ${errorMsg}`, { type: typeof value });
          (errors[field] ||= []).push(errorMsg);
        }
        
        if (typeof rule === 'string' && rule.startsWith('min:')) {
          const min = Number(rule.split(':')[1]);
          const length = typeof value === 'string' ? value.length : 0;
          console.log(`  Min length check (${min}) for ${field}:`, { length, passes: length >= min });
          
          if (length < min) {
            const errorMsg = `${field} must be at least ${min} characters.`;
            console.log(`  Validation failed: ${errorMsg}`);
            (errors[field] ||= []).push(errorMsg);
          }
        }
        
        if (rule === 'email' && typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const isValid = emailRegex.test(value.trim().toLowerCase());
          console.log(`  Email validation for ${field}:`, { value, isValid });
          
          if (!isValid) {
            const errorMsg = `${field} must be a valid email address.`;
            console.log(`  Validation failed: ${errorMsg}`);
            (errors[field] ||= []).push(errorMsg);
          }
        }
      }

      // normalize strings
      if (typeof value === 'string') {
        value = value.trim();
      }
      values[field] = value;
      console.log(`Final value for ${field}:`, value);
    }

    console.log('\nRaw values before sanitization:', values);
    const sanitized = this.sanitize(values);
    console.log('Values after sanitization:', sanitized);
    
    this.cleaned = sanitized;
    this.errors = errors;
    this.valid = Object.keys(errors).length === 0;
    
    console.log('\nFinal validation result:', {
      valid: this.valid,
      errors: this.errors,
      cleaned: this.cleaned
    });
    
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


