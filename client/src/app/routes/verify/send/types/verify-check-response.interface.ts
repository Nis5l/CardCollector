import { UserVerified } from './user-verified.enum';

export interface VerifyCheckResponse {
  verified: UserVerified,
  email: string
}
