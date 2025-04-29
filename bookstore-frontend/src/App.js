import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';

const API_URL = 'http://localhost:3000';

function App() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [searchParams, setSearchParams] = useState({
    title: '',
    author: '',
    genre: '',
    publisher: '',
  });

  useEffect(() => {
    fetchBooks();
    fetchGenres();
    fetchShelves();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${API_URL}/books`);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${API_URL}/genres`);
      setGenres(response.data);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchShelves = async () => {
    try {
      const response = await axios.get(`${API_URL}/shelves`);
      setShelves(response.data);
    } catch (error) {
      console.error('Error fetching shelves:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const params = {};
      if (searchParams.title) params.title = searchParams.title;
      if (searchParams.author) params.author = searchParams.author;
      if (searchParams.genre) params.genre = searchParams.genre;
      if (searchParams.publisher) params.publisher = searchParams.publisher;

      const response = await axios.get(`${API_URL}/search/books`, { params });
      setBooks(response.data);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const handleResetSearch = () => {
    setSearchParams({
      title: '',
      author: '',
      genre: '',
      publisher: '',
    });
    fetchBooks();
  };

  const handleOpenDialog = (book = null) => {
    setCurrentBook(
      book || {
        title: '',
        author: '',
        publisher: '',
        year: '',
        price: '',
        quantity: 1,
        GenreId: genres[0]?.id || '',
        ShelfId: shelves[0]?.id || '',
      }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentBook(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchParamChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (currentBook.id) {
        await axios.put(`${API_URL}/books/${currentBook.id}`, currentBook);
      } else {
        await axios.post(`${API_URL}/books`, currentBook);
      }
      fetchBooks();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/books/${id}`);
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Книжный магазин
          </Typography>
          <Button
            color="inherit"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Добавить книгу
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Поиск книг
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Название"
              name="title"
              value={searchParams.title}
              onChange={handleSearchParamChange}
              size="small"
            />
            <TextField
              label="Автор"
              name="author"
              value={searchParams.author}
              onChange={handleSearchParamChange}
              size="small"
            />
            <TextField
              label="Жанр"
              name="genre"
              value={searchParams.genre}
              onChange={handleSearchParamChange}
              size="small"
            />
            <TextField
              label="Издательство"
              name="publisher"
              value={searchParams.publisher}
              onChange={handleSearchParamChange}
              size="small"
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
            >
              Поиск
            </Button>
            <Button variant="outlined" onClick={handleResetSearch}>
              Сбросить
            </Button>
          </Box>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Автор</TableCell>
                <TableCell>Жанр</TableCell>
                <TableCell>Издательство</TableCell>
                <TableCell>Год</TableCell>
                <TableCell>Цена</TableCell>
                <TableCell>Количество</TableCell>
                <TableCell>Стеллаж</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.Genre?.name}</TableCell>
                  <TableCell>{book.publisher}</TableCell>
                  <TableCell>{book.year}</TableCell>
                  <TableCell>{book.price}</TableCell>
                  <TableCell>{book.quantity}</TableCell>
                  <TableCell>{book.Shelf?.number}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(book)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(book.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {currentBook?.id ? 'Редактировать книгу' : 'Добавить новую книгу'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Название"
              name="title"
              value={currentBook?.title || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Автор"
              name="author"
              value={currentBook?.author || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Жанр</InputLabel>
              <Select
                name="GenreId"
                value={currentBook?.GenreId || ''}
                onChange={handleInputChange}
                label="Жанр"
              >
                {genres.map((genre) => (
                  <MenuItem key={genre.id} value={genre.id}>
                    {genre.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Издательство"
              name="publisher"
              value={currentBook?.publisher || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Год издания"
              name="year"
              type="number"
              value={currentBook?.year || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Цена"
              name="price"
              type="number"
              value={currentBook?.price || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Количество"
              name="quantity"
              type="number"
              value={currentBook?.quantity || ''}
              onChange={handleInputChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Стеллаж</InputLabel>
              <Select
                name="ShelfId"
                value={currentBook?.ShelfId || ''}
                onChange={handleInputChange}
                label="Стеллаж"
              >
                {shelves.map((shelf) => (
                  <MenuItem key={shelf.id} value={shelf.id}>
                    {shelf.number} ({shelf.location})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;
