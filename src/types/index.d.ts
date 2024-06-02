/* eslint-disable @typescript-eslint/ban-types */
export {};

declare global {
  interface ReqUser {
    id: string;
    name: string;
    email: string;
  }

  interface JwtPayload {
    id: string;
    name: string;
    email: string;
    roles: string[];
    iat: number;
    exp: number;
    role: UserRoles;
  }

  interface TestCandidatePayload {
    id: string;
    url: string;
    candidateId: string;
    type: string;
    iat: number;
    exp: number;
  }
}

declare module 'Express' {
  interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
    role: UserRoles;
  }
}
