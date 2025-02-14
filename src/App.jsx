import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField"; 
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBook from "./AddBook";
import { ClientSideRowModelModule } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

function App() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);  
  const [searchTerm, setSearchTerm] = useState("");  

  const columnDefs = [
    { field: "title", sortable: true, filter: true },
    { field: "author", sortable: true, filter: true },
    { field: "year", sortable: true, filter: true },
    { field: "isbn", sortable: true, filter: true },
    { field: "price", sortable: true, filter: true },  
    { 
      headerName: "", 
      field: "id", 
      width: 90, 
      cellRenderer: (params) => (
        <IconButton onClick={() => deleteBook(params.value)} size="small" color="error">
          <DeleteIcon />
        </IconButton>
      ) 
    }
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchTerm, books]); 

  const fetchBooks = () => {
    fetch("https://bookstore-1af15-default-rtdb.europe-west1.firebasedatabase.app/books.json")
      .then(response => response.json())
      .then(data => {
        console.log("Fetched Data:", data); 
  
        if (!data) {
          console.warn("No books found in Firebase response.");
          setBooks([]);
          return;
        }
  
        const formattedBooks = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
  
        setBooks(formattedBooks);
      })
      .catch(err => console.error("Fetch error:", err));
  };

  const addBook = (newBook) => {
    fetch("https://bookstore-1af15-default-rtdb.europe-west1.firebasedatabase.app/books/.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBook),
    })
    .then(() => fetchBooks())
    .catch(err => console.error(err));
  };

  const deleteBook = (id) => {
    fetch(`https://bookstore-1af15-default-rtdb.europe-west1.firebasedatabase.app/books/${id}.json`, {
      method: "DELETE",
    })
    .then(() => fetchBooks())
    .catch(err => console.error(err));
  };


  const filterBooks = () => {
    if (!searchTerm) {
      setFilteredBooks(books);
      return;
    }

    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredBooks(filtered);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h5">Johnny's Bookstore</Typography>
        </Toolbar>
      </AppBar>
      <AddBook addBook={addBook} />

     
      <TextField
        label="Search by Title or Author"
        variant="outlined"
        fullWidth
        margin="dense"
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="ag-theme-material" style={{ height: 600, width: 1500 }}>
        <AgGridReact
          modules={[ClientSideRowModelModule]}  
          rowModelType="clientSide"
          rowData={filteredBooks}  
          columnDefs={columnDefs}
        />
      </div>
    </>
  );
}

export default App;
