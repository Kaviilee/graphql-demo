import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLScalarType
} from 'graphql';
import models from '../models';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import { getUserId } from '../utils';
// import { v4 } from 'uuid';

const { Todo, User } = models;

const ResponseType = new GraphQLObjectType({
  name: 'Response',
  fields: () => ({
    success: {
      type: GraphQLBoolean
    },
    message: {
      type: GraphQLString
    },
    data: {
      type: new GraphQLScalarType({
        name: 'data'
      })
    }
  })
});

const TodoType = new GraphQLObjectType({
  name: 'Todo',
  fields: () => ({
    _id: {
      type: GraphQLID
    },
    name: {
      type: GraphQLString
    },
    content: {
      type: GraphQLString
    },
    createdAt: {
      type: GraphQLString
    },
    userId: {
      type: GraphQLString,
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    _id: {
      type: GraphQLID
    },
    username: {
      type: GraphQLString
    },
    password: {
      type: GraphQLString
    },
    token: {
      type: GraphQLString
    },
    todo: {
      type: new GraphQLList(TodoType),
      resolve: (parent) => {
        return Todo.find({ _id: parent.id });
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    todo: {
      type: TodoType,
      args: {
        id: {
          type: GraphQLID
        },
      },
      resolve(_, args) {
        return Todo.findById(args.id);
      }
    },
    todosByUser: {
      type: new GraphQLList(TodoType),
      args: {
        userId: {
          type: GraphQLString
        }
      },
      resolve: (_, __, req) => {
        const userId = getUserId(req);
        console.log(userId);
        return Todo.find({ userId });
      }
    },
    todos: {
      type: new GraphQLList(TodoType),
      resolve: () => {
        return Todo.find({});
      }
    },
    user: {
      type: UserType,
      args: {
        id: {
          type: GraphQLString
        }
      },
      resolve: async(parent, args) => {
        return await User.findById(args.id);
      }
    },
    users:{
      type: new GraphQLList(UserType),
      resolve: async() =>  {
          return await User.find({});
      }
    }
  },
});

// mutation
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    login: {
      type: ResponseType,
      args: {
        username: {
          type: new GraphQLNonNull(GraphQLString)
        },
        password: {
          type: new GraphQLNonNull(GraphQLString)
        },
      },
      resolve: async (parent, { username, password }: { username: string; password: string; }, request) => {
        console.log(request);
        const user = await User.findOne({ username });

        if (!user) {
          return  {
            success: false,
            message: `User: ${username} doesn't exists!`
          };
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
          return {
            success: false,
            message: 'Invalid password'
          };
        }

        const token = jsonwebtoken.sign(
          { id: user._id, username: user.username },
          process.env.SECRET_TOKEN,
          { expiresIn: '7d' }
        );

        user.token = token;

        await user.save();

        return {
          success: true,
          message: "login successed",
          data: {
            token
          }
        };
      }
    },
    addUser: {
      type: ResponseType,
      args: {
        username: {
          type: new GraphQLNonNull(GraphQLString)
        },
        password: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: async(parent, args) => {
        const user = new User({
          username: args.username,
          password: await bcrypt.hash(args.password, 10),
        });

        await user.save();
        return {
          success: true,
          message: 'add user successed',
          data: {
            user
          }
        };
      }
    },
    addTodo: {
      type: ResponseType,
      args: {
        name: {
          type: GraphQLString,
        },
        content: {
          type: GraphQLString
        },
      },
      resolve(parent, args, req) {
        const userId = getUserId(req);
        // console.log(userId);
        const todo = new Todo({
          userId,
          name: args.name,
          content: args.content,
          createdAt: new Date()
        });

        return todo.save();
      }
    }
  }
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});

export default schema;
