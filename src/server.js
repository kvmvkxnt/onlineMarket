import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { PORT } from './config.js';
import cookie from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import usersRouter from './routers/users.js';
import categoriesRouter from './routers/categories.js';
import subCategoriesRouter from './routers/subCategories.js';
import productsRouter from './routers/products.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload());
app.use(cookie());
app.use(express.urlencoded({extended: true}));

app.use(usersRouter);
app.use(categoriesRouter);
app.use(subCategoriesRouter);
app.use(productsRouter);

app.use((error, req, res, _) => {
  console.log(error);

  if (error.status != 500) {
    res.status(error.status).json({
      status: error.status,
      message: error.message
    });
  }

  fs.appendFileSync(path.join(process.cwd(), 'log.txt'),
  `${new Date()} ||| ${error.status} ||| ${req.url} ||| ${error.name} ||| ${error.message}\n`);

  res.status(error.status).json({
    status: error.status,
    message: 'InternalServerError'
  });

  process.exit();
});

app.listen(PORT, () => console.log(`Listening at *${PORT}`));
