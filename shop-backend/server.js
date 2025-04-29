const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const sequelize = new Sequelize('bookstore', 'root', '', {
  host: 'localhost',
  //mysql for docker
  dialect: 'mysql',
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

const Genre = sequelize.define('Genre', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

const Shelf = sequelize.define('Shelf', {
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Book = sequelize.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  publisher: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
});

Genre.hasMany(Book);
Book.belongsTo(Genre);

Shelf.hasMany(Book);
Book.belongsTo(Shelf);

sequelize.sync({ alter: true }).then(() => {
  console.log('Database & tables synced');
});

app.get('/books', async (req, res) => {
  try {
    const books = await Book.findAll({
      include: [Genre, Shelf],
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [Genre, Shelf],
    });
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/books', async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/books/:id', async (req, res) => {
  try {
    const [updated] = await Book.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedBook = await Book.findByPk(req.params.id);
      res.json(updatedBook);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/books/:id', async (req, res) => {
  try {
    const deleted = await Book.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/genres', async (req, res) => {
  try {
    const genres = await Genre.findAll();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/genres', async (req, res) => {
  try {
    const genre = await Genre.create(req.body);
    res.status(201).json(genre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/shelves', async (req, res) => {
  try {
    const shelves = await Shelf.findAll();
    res.json(shelves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/shelves', async (req, res) => {
  try {
    const shelf = await Shelf.create(req.body);
    res.status(201).json(shelf);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/search/books', async (req, res) => {
  try {
    const { title, author, genre, publisher } = req.query;
    const where = {};

    if (title) where.title = { [Sequelize.Op.like]: `%${title}%` };
    if (author) where.author = { [Sequelize.Op.like]: `%${author}%` };
    if (publisher) where.publisher = { [Sequelize.Op.like]: `%${publisher}%` };

    const include = [];
    if (genre) {
      include.push({
        model: Genre,
        where: { name: { [Sequelize.Op.like]: `%${genre}%` } },
      });
    } else {
      include.push(Genre);
    }

    include.push(Shelf);

    const books = await Book.findAll({
      where,
      include,
    });

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
