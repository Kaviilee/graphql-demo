import { Schema, model, Document } from "mongoose";
import { ITodo } from './todo';

export interface IUser extends Document {
  username: string;
  password: string;
  token: string;
  todo: ITodo[]; 
}

const userSchema = new Schema({
  username: String,
  password: String,
  token: String,
  todo: []
});

const User = model<IUser>('User', userSchema);

export default User;
