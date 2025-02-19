import { ICustomValidationParams } from 'types';

const zero = 0;
const one = 1;
/**
 * @param {ICustomValidationParams} params - Validation parameters
 * @returns {boolean} true | false
 */
export const isValidFormData = (params: ICustomValidationParams) => {
  const { setShowErrorMessage, showErrorMessage, formData } = params;
  let valid = true;
  const errorMessage: typeof showErrorMessage = {};
  Object.entries(formData).forEach((item) => {
    if (item[zero] !== '_id' && item[one] !== zero && !item[one]) {
      errorMessage[item[zero]] = true;
      if (valid) {
        valid = false;
      }
    }
  });
  if (!valid) {
    setShowErrorMessage({ ...showErrorMessage, ...errorMessage });
  }
  return valid;
};
