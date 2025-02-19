/* eslint-disable no-process-env */

interface IBranding {
  BRAND_NAME: string;
  BRAND_FULL_NAME: string;
}

const branding: IBranding = {
  BRAND_NAME: process.env.REACT_APP_BRAND_NAME as string,
  BRAND_FULL_NAME: process.env.REACT_APP_BRAND_FULL_NAME as string,
};

export { branding };
