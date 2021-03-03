import express from "express";
import session from 'express-session';
import { graphqlHTTP } from "express-graphql";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from "body-parser";
import cors from "cors";

import schema from './schema';

dotenv.config();

const app = express();

app.use(session({ secret: process.env.SECRET_TOKEN, cookie: { maxAge: 604800, secure: true } }));

const mongoDB = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.DB_HOST}/mongodb?authSource=admin`;
// ${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.DB_HOST}

mongoose.connect(mongoDB);

const db = mongoose.connection;

app.use(bodyParser.json());

app.use(cors());

app.use("/graphql", graphqlHTTP({
  schema,
  graphiql: true
}));

app.use(express.static("public"));

db.on('error', () => {
  console.log('Db connection established');
});

db.once('open', () => {
  app.listen(4000, () => {
    console.info("Now browse is runing on localhost:4000");
  });
});

