export const MIN_PASSWORD_LENGTH = 8;
export const STRONG_PASSWORD_REG_EXP = new RegExp(
  '(?=.*[0-9])(?=.*[!@#$%^&*()_+=])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*()_+=]{' +
    MIN_PASSWORD_LENGTH +
    ',}',
  'g',
);

export const VERIFY_CODE_REG_EXP = new RegExp('^d{6}$', 'gm');
