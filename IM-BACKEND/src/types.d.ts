/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */

/**
 * d.ts files are treated as an ambient module declarations
 * only if they don't have any imports. If you provide an
 * import line, it's now treated as a normal module file,
 * not the global one, so augmenting modules definitions
 * doesn't work.
 */

declare namespace Express {
    interface Request {
      // current user details
      user: {
        /**
         * this id will be always referring towards signed in user
         */
        id: string;
        role: string;
        email: string;
      };
      userGroup?: [
        {
          id: string;
          name: string;
          // root user details
          root_user: {
            id: string;
            role: string;
            email: string;
            username:string
          };
          users: Array<string>;
          default: boolean;
        }
      ];
      body: Record<string, unknown>;
    }
  }
  
  