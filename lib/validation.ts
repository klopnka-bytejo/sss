/**
 * Form validation schemas for client and server-side validation
 */

export const ValidationSchemas = {
  // User/Auth validation
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : 'Invalid email address'
  },

  password: (value: string) => {
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(value)) return 'Must contain uppercase letter'
    if (!/[a-z]/.test(value)) return 'Must contain lowercase letter'
    if (!/[0-9]/.test(value)) return 'Must contain number'
    if (!/[!@#$%^&*]/.test(value)) return 'Must contain special character'
    return null
  },

  username: (value: string) => {
    if (value.length < 3) return 'Username must be at least 3 characters'
    if (value.length > 30) return 'Username must be less than 30 characters'
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Username can only contain letters, numbers, hyphens, and underscores'
    return null
  },

  fullName: (value: string) => {
    if (!value.trim()) return 'Name is required'
    if (value.length < 2) return 'Name must be at least 2 characters'
    if (value.length > 100) return 'Name must be less than 100 characters'
    return null
  },

  // Service validation
  serviceTitle: (value: string) => {
    if (value.length < 5) return 'Title must be at least 5 characters'
    if (value.length > 100) return 'Title must be less than 100 characters'
    return null
  },

  serviceDescription: (value: string) => {
    if (value.length < 20) return 'Description must be at least 20 characters'
    if (value.length > 1000) return 'Description must be less than 1000 characters'
    return null
  },

  price: (value: number) => {
    if (value <= 0) return 'Price must be greater than 0'
    if (value > 10000) return 'Price cannot exceed $10,000'
    return null
  },

  gameName: (value: string) => {
    if (!value.trim()) return 'Game name is required'
    if (value.length < 2) return 'Game name must be at least 2 characters'
    return null
  },

  // PRO application validation
  yearsOfExperience: (value: number) => {
    if (value < 0) return 'Years of experience cannot be negative'
    if (value > 100) return 'Years of experience seems invalid'
    return null
  },

  bio: (value: string) => {
    if (value.length < 10) return 'Bio must be at least 10 characters'
    if (value.length > 500) return 'Bio must be less than 500 characters'
    return null
  },

  discordUsername: (value: string) => {
    if (!value.trim()) return 'Discord username is required'
    if (value.length < 2) return 'Discord username must be at least 2 characters'
    if (value.length > 32) return 'Discord username must be less than 32 characters'
    return null
  },

  // Order/Checkout validation
  orderTitle: (value: string) => {
    if (value.length < 5) return 'Title must be at least 5 characters'
    if (value.length > 200) return 'Title must be less than 200 characters'
    return null
  },

  orderDescription: (value: string) => {
    if (value.length < 10) return 'Description must be at least 10 characters'
    if (value.length > 2000) return 'Description must be less than 2000 characters'
    return null
  },

  // Generic validators
  required: (value: any) => {
    if (value === null || value === undefined || value === '') return 'This field is required'
    return null
  },

  minLength: (min: number) => (value: string) => {
    return value.length < min ? `Must be at least ${min} characters` : null
  },

  maxLength: (max: number) => (value: string) => {
    return value.length > max ? `Must be less than ${max} characters` : null
  },

  match: (pattern: RegExp, message: string) => (value: string) => {
    return pattern.test(value) ? null : message
  },

  custom: (validator: (value: any) => boolean, message: string) => (value: any) => {
    return validator(value) ? null : message
  },
}

/**
 * Form field validator - chains multiple validators
 */
export class FieldValidator {
  private validators: Array<(value: any) => string | null> = []

  add(validator: (value: any) => string | null) {
    this.validators.push(validator)
    return this
  }

  validate(value: any): string | null {
    for (const validator of this.validators) {
      const error = validator(value)
      if (error) return error
    }
    return null
  }
}

/**
 * Form validator - validates entire form
 */
export class FormValidator {
  private fields: Map<string, FieldValidator> = new Map()
  private errors: Map<string, string> = new Map()

  addField(fieldName: string, validator: FieldValidator) {
    this.fields.set(fieldName, validator)
    return this
  }

  validate(data: Record<string, any>): { valid: boolean; errors: Record<string, string> } {
    this.errors.clear()

    for (const [fieldName, validator] of this.fields) {
      const error = validator.validate(data[fieldName])
      if (error) {
        this.errors.set(fieldName, error)
      }
    }

    return {
      valid: this.errors.size === 0,
      errors: Object.fromEntries(this.errors),
    }
  }

  getError(fieldName: string): string | null {
    return this.errors.get(fieldName) || null
  }
}

/**
 * Pre-built validators for common forms
 */
export const FormValidators = {
  // Login form
  login: () => {
    const validator = new FormValidator()
    validator.addField('email', new FieldValidator().add(ValidationSchemas.required).add(ValidationSchemas.email))
    validator.addField('password', new FieldValidator().add(ValidationSchemas.required))
    return validator
  },

  // Registration form
  registration: () => {
    const validator = new FormValidator()
    validator.addField('email', new FieldValidator().add(ValidationSchemas.required).add(ValidationSchemas.email))
    validator.addField('password', new FieldValidator().add(ValidationSchemas.required).add(ValidationSchemas.password))
    validator.addField('fullName', new FieldValidator().add(ValidationSchemas.required).add(ValidationSchemas.fullName))
    validator.addField('acceptTerms', new FieldValidator().add(ValidationSchemas.required))
    return validator
  },

  // Service creation form
  serviceCreation: () => {
    const validator = new FormValidator()
    validator.addField('title', new FieldValidator().add(ValidationSchemas.required).add(ValidationSchemas.serviceTitle))
    validator.addField('description', new FieldValidator().add(ValidationSchemas.required).add(ValidationSchemas.serviceDescription))
    validator.addField('price', new FieldValidator().add(ValidationSchemas.required).add(ValidationSchemas.price))
    validator.addField('games', new FieldValidator().add(ValidationSchemas.required))
    return validator
  },

  // PRO application form
  proApplication: () => {
    const validator = new FormValidator()
    validator.addField('fullName', new FieldValidator().add(ValidationSchemas.required).add(ValidationSchemas.fullName))
    validator.addField('email', new FieldValidator().add(ValidationSchemas.required).add(ValidationSchemas.email))
    validator.addField('discordUsername', new FieldValidator().add(ValidationSchemas.required).add(ValidationSchemas.discordUsername))
    validator.addField('gamerTag', new FieldValidator().add(ValidationSchemas.required))
    validator.addField('games', new FieldValidator().add(ValidationSchemas.required))
    validator.addField('yearsOfExperience', new FieldValidator().add(ValidationSchemas.required).add(ValidationSchemas.yearsOfExperience))
    validator.addField('bio', new FieldValidator().add(ValidationSchemas.required).add(ValidationSchemas.bio))
    validator.addField('country', new FieldValidator().add(ValidationSchemas.required))
    return validator
  },
}
