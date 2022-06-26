import sha256 from 'sha256';
import jwt from '../utils/jwt.js';
import { InternalServerError, AuthorizationError } from '../utils/errors.js';
import { read, write } from '../utils/model.js';
import path from 'path';

function GET(req, res, next) {
  try {
    let { userId } = req.params;
    let users = read('users').filter(user => delete user.password);

    if (userId) {
      let [user] = users.filter(user => user.id == userId);
      res.status(200).json({
        status: 200,
        message: 'ok',
        data: user
      });
    }

    res.status(200).json({
      status: 200,
      message: 'ok',
      data: users
    });

  } catch (e) {
    return next(new InternalServerError(500, e.message));
  } 
}

function LOGIN(req, res, next) {
  try {
    let { username, password } = req.body;
    let users = read('users');

    let user = users.find(user => user.username == username && user.password == sha256(password));

    if (!user) {
      return next(new AuthorizationError(401, 'wrong username or password'));
    }

    delete user.password;

    res.status(200).json({
      status: 200,
      message: 'ok',
      token: jwt.sign({userId: user.id}),
      data: user
    });

  } catch (e) {
    return next(new InternalServerError(500, e.message));
  }
}

function REGISTER(req, res, next) {
  try {
    let users = read('users');
    let { username, password } = req.body;

    if (users.find(user => user.username == username)) {
      return next(new AuthorizationError(401, 'this user already exists'));
    }

    if (req.files) {
      let fileName = `${Date.now()}_${username.replace(/\s/g, '')}_avatar.${req.files.avatar.name.split('.').at(-1)}`;
      req.files.avatar.mv(path.join(process.cwd(), 'uploads', fileName));
      req.body.avatar = fileName;
    }

    req.body.password = sha256(password);
    req.body.id = users.at(-1)?.id + 1 || 1;

    users.push(req.body);
    write('users', users);

    delete req.body.password;

    res.cookie('token', jwt.sign({userId: req.body.id}));

    res.status(201).json({
      status: 201,
      message: 'ok',
      token: jwt.sign({userId: req.body.id}),
      data: req.body
    });

  } catch (e) {
    return next(new InternalServerError(500, e.message));
  }
}

export default {
  GET,
  LOGIN,
  REGISTER
}
