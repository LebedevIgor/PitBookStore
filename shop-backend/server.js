const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const mysql = require('mysql2/promise'); // Используем промис-версию mysql2

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Функция для создания базы данных, если она не существует
async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
  });

  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS bookstore');
    console.log('База данных "bookstore" создана или уже существует');
  } catch (error) {
    console.error('Ошибка при создании базы данных:', error);
  } finally {
    await connection.end();
  }
}

// Основная функция для запуска приложения
async function startApp() {
  // Убедимся, что база данных существует
  await ensureDatabaseExists();

  // Подключаемся к базе данных через Sequelize
  const sequelize = new Sequelize('bookstore', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
  });

  try {
    await sequelize.authenticate();
    console.log('Соединение с базой данных успешно установлено.');
  } catch (error) {
    console.error('Не удалось подключиться к базе данных:', error);
    return;
  }

  // Определение моделей и синхронизация
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

  await sequelize.sync({ alter: true });
  console.log('База данных и таблицы синхронизированы');
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
      if (publisher)
        where.publisher = { [Sequelize.Op.like]: `%${publisher}%` };

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
  // Запуск сервера
  const PORT = process.env.PORT || 3005;
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
}

// Запуск приложения
startApp().catch((error) => {
  console.error('Ошибка при запуске приложения:', error);
});
