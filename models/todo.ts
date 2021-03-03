import { Schema, model, Document } from "mongoose";

export interface ITodo extends Document {
  userId: string;
  name: string;
  content: string;
  createdAt: string;
}

const todoSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    default: new Date()
  },
});

const Todo = model<ITodo>('Todo', todoSchema);

export default Todo;