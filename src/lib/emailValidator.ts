/**
 * Email validation utilities
 */

/**
 * Validates that the email is NOT a university email
 * @param email - The email to validate
 * @returns true if email is valid (not university), false otherwise
 */
export function validateNonUniversityEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // List of university email domains to block
  const universityDomains = [
    'zu.edu.eg',
    'zuj.edu.eg', 
    'zagazig.edu.eg',
    'university.edu',
    'edu.eg',
    'student.edu',
    'academic.edu'
  ];

  // Extract domain from email
  const emailDomain = email.toLowerCase().trim().split('@')[1];
  
  if (!emailDomain) {
    return false;
  }

  // Check if email domain is in university domains list
  const isUniversityEmail = universityDomains.some(domain => 
    emailDomain === domain || emailDomain.endsWith('.' + domain)
  );

  // Return true if it's NOT a university email (valid for our platform)
  return !isUniversityEmail;
}

/**
 * Basic email format validation
 * @param email - The email to validate
 * @returns true if email format is valid, false otherwise
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // More comprehensive email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim());
}

/**
 * Complete email validation (format + non-university)
 * @param email - The email to validate
 * @returns object with validation result and message
 */
export function validateEmail(email: string): { isValid: boolean; message: string } {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'البريد الإلكتروني مطلوب' };
  }

  const trimmedEmail = email.trim();

  if (!isValidEmailFormat(trimmedEmail)) {
    return { isValid: false, message: 'تنسيق البريد الإلكتروني غير صحيح' };
  }

  if (!validateNonUniversityEmail(trimmedEmail)) {
    return { 
      isValid: false, 
      message: 'ممنوع استخدام البريد الإلكتروني الجامعي. يرجى استخدام بريد إلكتروني شخصي.' 
    };
  }

  return { isValid: true, message: 'البريد الإلكتروني صحيح' };
}
