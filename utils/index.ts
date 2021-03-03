import jwt from 'jsonwebtoken';

const getTokenPayload = (token: string) => jwt.verify(token, process.env.SECRET_TOKEN);

const getUserId = (req: any, authToken?: string): string => {
  if (req) {
    const authHeader: string = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');

      if (!token) {
        throw new Error('No token found');
      }

      const { id }: any = getTokenPayload(token);

      return id;
    }
  } else if (authToken) {
    const token = authToken.replace('Bearer ', '');

      if (!token) {
        throw new Error('No token found');
      }

      const { id }: any = getTokenPayload(token);

      return id;
    }

    // return id;

  throw new Error('Not authenticated');
};

export {
  getUserId
};
