export interface IUser {
  id: string;
  email: string;
  hashed_pass: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}
