const express = require('express');
const path = require('path');
const fs = require('fs');

const uuid = require('./helpers/uuid')

const app = express();


const PORT = process.env.PORT || 3001;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json(err);
        } else {
           
            const parsedNotes = JSON.parse(data);
            res.status(200).json(parsedNotes);
        }
    });
});


app.delete('/api/notes/:id', (req, res) => {
    
    console.info(`${req.method} request received to delete a note`);
  
    
    const noteId = req.params.id;
  
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        res.status(500).json(err);
      } else {
        
        const parsedNotes = JSON.parse(data);
       
        const updatedNotes = parsedNotes.filter((note) => note.id !== noteId);
  
        fs.writeFile('./db/db.json', JSON.stringify(updatedNotes), (err, data) => {
          if (err) {
            res.status(500).json(err);
          } else {
            res.status(200).json({ status: 'success' });
          }
        });
      }
    });
  });


app.post('/api/notes', (req, res) => {
    
    console.info(`${req.method} request received to add a note`);

   
    const { title, text } = req.body;

    
    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        const userNote = {
            status: 'success',
            body: newNote,
        };
        console.log(userNote);
        
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                res.status(500).json(err);
            } else {
               
                const parsedNotes = JSON.parse(data);
                parsedNotes.push(newNote);
                fs.writeFile('./db/db.json', JSON.stringify(parsedNotes), (err, data) => {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(201).json(newNote);
                    }
                });
            }
        });
    } else {
        
        res.status(400).json('Enter a title and text for your note');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});