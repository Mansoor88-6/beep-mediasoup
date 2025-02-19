export enum UserRoles {
  Admin = 'admin',
  Client = 'client',
  SubClient = 'subclient'
}

export enum Environment {
  Production = 'production',
  Development = 'development',
  Testing = 'testing'
}

export enum AuthErrors {
  LogOut = 'Session Expired, Loging Out!',
  LoginNeeded = 'Previous Session Expired, Please login Again!'
}

export interface ICustomValidationParams {
  setShowErrorMessage: (value: any) => void;
  formData: any;
  showErrorMessage: { [string: string]: boolean };
}

export enum InputLength {
  // commons
  DYNAMIC_INPUTS_LENGTH = 400,
  EMAIL_LENGTH = 100,
  USERNAME_LENGTH = 100,
  PASSWORD_LENGTH = 100,
  DESCRIPTION_LENGTH = 500
}

export interface IRandomColorProps {
  hue?: number | string | undefined;
  luminosity?: 'bright' | 'light' | 'dark' | 'random' | undefined;
  seed?: number | string | undefined;
  format?:
    | 'hsvArray'
    | 'hslArray'
    | 'hsl'
    | 'hsla'
    | 'rgbArray'
    | 'rgb'
    | 'rgba'
    | 'hex'
    | undefined;
  alpha?: number | undefined;
  count?: number | undefined;
}
