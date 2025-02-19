/* eslint-disable camelcase */
import { FormInstance } from 'antd';
import randomColor from 'randomcolor';
import { IRandomColorProps } from 'types';
/**
 * reset fields with undefined data rather than initialData
 * @param {FormInstance<any>} form form data
 * @returns {void} void
 */
export const resetFormFields = (form: FormInstance<any>): void => {
  Object.keys(form.getFieldsValue()).forEach((key) => {
    form.setFieldValue(key, undefined);
  });
};

/**
 * populate fields with data
 * @param {Record<string, unknown>} data form data
 * @param {FormInstance<any>} form form data
 * @returns {void} void
 */
export const initFormFields = (data: Record<string, unknown>, form: FormInstance<any>): void => {
  Object.keys(data).forEach((key) => {
    form.setFieldValue(key, data[key]);
  });
};

/**
 * Check if required detailed report is available
 * @param {string} string emailgateway detailed report
 * @returns {false | URL} true | false
 */
export const isValidHttpUrl = (string?: string): false | URL => {
  let url: string | URL | null | undefined = string;

  try {
    if (url) {
      url = new URL(url);
    } else {
      return false;
    }
  } catch (_) {
    return false;
  }

  return url;
};

/**
 * Humanize coded text
 * @param {string} str - str to humanize
 * @returns {string} - humanize string
 */
export const humanize = (str: string): string => {
  const zero = 0;
  const one = 1;
  const frags = str.split('_');
  for (let i = zero; i < frags.length; i++) {
    frags[i] = frags[i].charAt(zero).toUpperCase() + frags[i].slice(one);
  }
  return frags.join(' ');
};

/**
 * Check if url is encoded
 * @param {string} uri - url to be checked
 * @returns {boolean} - True if the object is a uri encoded, false otherwise
 */
export const isComponentURIEncoded = (uri: string): boolean => {
  try {
    const url = uri;
    return url !== decodeURIComponent(url);
  } catch (err) {
    return false;
  }
};

/**
 * Check if url is encoded
 * @param {string} uri - url to be decoded
 * @returns {string} - True if the object is a uri encoded, false otherwise
 */
export const fullyDecodeURIComponent = (uri: string): string => {
  let url = uri;
  while (isComponentURIEncoded(url)) {
    url = decodeURIComponent(uri);
  }
  return url;
};

/**
 * Random color generator
 * @param {IRandomColorProps} props - prm
 * @returns {string} - string
 */
export const getRandomColor = (props: IRandomColorProps) => {
  return randomColor(props);
};
