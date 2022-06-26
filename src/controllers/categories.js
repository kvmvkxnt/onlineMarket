import { InternalServerError, ForbiddenError, notFoundError } from '../utils/errors.js';
import { read, write } from '../utils/model.js';

function GET(req, res, next) {
  try {
    let { id } = req.params;
    let categories = read('categories');
    let subCategories = read('subcategories');

    subCategories.map(sub => {
      sub.subCategoryId = sub.sub_category_id;
      delete sub.sub_category_id;

      sub.subCategoryName = sub.sub_category_name;
      delete sub.sub_category_name;

      return sub;
    });

    categories = categories.map(cat => {
      cat.categoryId = cat.category_id;
      delete cat.category_id;

      cat.categoryName = cat.category_name;
      delete cat.category_name;

      cat.subCategories = subCategories.filter(sub => sub.category_id == cat.categoryId).map(sub => {
        delete sub.category_id;
        return sub;
      });

      return cat;
    });

    if (id) {
      let [category] = categories.filter(cat => cat.categoryId == id);
      res.status(200).json({
        status: 200,
        message: 'ok',
        data: category
      });
    }

    res.status(200).json({
      status: 200,
      message: 'ok',
      data: categories
    });
  } catch (e) {
    return next(new InternalServerError(500, e.message));
  }
}

function POST(req, res, next) {
  try {
    let categories = read('categories');
    let { categoryName } = req.body;

    if (!categoryName) {
      return next(new ForbiddenError(403, 'no title provided'));
    }

    if (categories.find(cat => cat.category_name == categoryName)) {
      return next(new ForbiddenError(403, 'category with this name already exists'));
    }

    req.body.category_id = categories.at(-1)?.category_id + 1 || 1;
    req.body.category_name = categoryName;
    delete req.body.categoryName;

    categories.push(req.body);
    write('categories', categories);

    req.body.categoryName = req.body.category_name;
    delete req.body.category_name;

    req.body.categoryId = req.body.category_id;
    delete req.body.category_id;

    res.status(201).json({
      status: 201,
      message: 'ok',
      data: req.body
    });

  } catch (e) {
    return next(new InternalServerError(500, e.message));
  }
}

function PUT(req, res, next) {
  try {
    let categories = read('categories');
    let subCategories = read('subcategories');
    let { categoryName } = req.body;
    let { id } = req.params;
    let editable = categories.find(cat => cat.category_id == id);

    if (!editable) {
      return next(new notFoundError(404, 'no video found :('));
    }

    if (!categoryName) {
      return next(new ForbiddenError(403, 'no new title'));
    }

    if (editable.category_name == categoryName) {
      return next(new ForbiddenError(403, 'new title is as same as previous'));
    }

    if (categories.find(cat => cat.category_name == categoryName)) {
      return next(new ForbiddenError(403, 'this category name is already used'))
    }

    editable.category_name = categoryName;

    write('categories', categories);

    editable.categoryName = categoryName;
    editable.categoryId = editable.category_id;

    delete editable.category_name;
    delete editable.category_id;

    editable.subCategories = subCategories.filter(sub => sub.category_id == editable.categoryId).map(sub => {
      sub.subCategoryId = sub.sub_category_id;
      sub.subCategoryName = sub.sub_category_name;

      delete sub.sub_category_name;
      delete sub.sub_category_id;
      delete sub.category_id;
      return sub;
    })

    res.status(201).json({
      status: 201,
      message: 'ok',
      data: editable
    });

  } catch (e) {
    return next(new InternalServerError(500, e.message));
  }
}

function DELETE(req, res, next) {
  try {
    let categories = read('categories');
    let subCategories = read('subcategories');
    let { id } = req.params;
    let deletableIndex = categories.findIndex(cat => cat.category_id == id);
    let deletedSubs;

    if (deletableIndex == -1) {
      return next(new notFoundError(404, 'such video not found'));
    }

    if (subCategories.filter(sub => sub.category_id == id).length) {
      let deletableCategories = subCategories.filter(sub => sub.category_id == id);
      let firstDeletableIndex = subCategories.findIndex(sub => sub.sub_category_id == deletableCategories[0].sub_category_id);
      deletedSubs = subCategories.splice(firstDeletableIndex, deletableCategories.length).map(sub => {
        sub.subCategoryId = sub.sub_category_id;
        sub.subCategoryName = sub.sub_category_name;

        delete sub.sub_category_name;
        delete sub.sub_category_id;
        delete sub.category_id;
        return sub;
      });
    }

    const [deleted] = categories.splice(deletableIndex, 1);
    deleted.subCategories = deletedSubs ? deletedSubs : [];
    deleted.categoryName = deleted.category_name;
    deleted.categoryId = deleted.category_id;

    delete deleted.category_id;
    delete deleted.category_name;

    write('subcategories', subCategories);
    write('categories', categories);

    res.status(201).json({
      status: 201,
      message: 'ok',
      data: deleted
    });

  } catch (e) {
    return next(new InternalServerError(500, e.message));
  }
}

export default {
    GET,
    POST,
    PUT,
    DELETE
}
