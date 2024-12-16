import express from 'express';
import bodyParser from 'body-parser';
import database from './database.js';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('static'));

app.get('/', (request, response) => {
   database.all('SELECT * FROM tasklists', (error, tasklists) => {
      if (error) {
         console.error(error);
         response.status(500).render('error', { error: error });
         return;
      }

      response.render('index', { tasklists: tasklists });
   });
});

app.get('/tasklist/:id', (request, response) => {
   const tasklistId = request.params.id;
   database.get('SELECT * FROM tasklists WHERE id = ?', [tasklistId], (error, tasklist) => {
      if (error) {
         console.error(error);
         response.status(500).render('error', { error: error });
         return;
      }

      if (!tasklist) {
         response.status(404).render('error', { error: new Error('Tasklist not found') });
         return;
      }

      database.all('SELECT * FROM todos WHERE tasklist_id = ?', [tasklistId], (error, todos) => {
         if (error) {
            console.error(error);
            response.status(500).render('error', { error: error });
            return;
         }

         response.render('tasklist', { tasklist: tasklist, todos: todos });
      });
   });
});

io.on('connection', (socket) => {
   socket.on('addTasklist', ({ name }) => {
      database.run('INSERT INTO tasklists (name) VALUES (?)', [name], function (error) {
         if (error) {
            console.error(error);
            return;
         }
         const tasklist = { id: this.lastID, name };
         io.emit('tasklistAdded', tasklist);
      });
   });

   socket.on('deleteTasklist', ({ id }) => {
      database.run('DELETE FROM tasklists WHERE id = ?', [id], (error) => {
         if (error) {
            console.error(error);
            return;
         }
         io.emit('tasklistDeleted', id);
      });
   });

   socket.on('addTodo', ({ name, tasklist_id }) => {
      database.run('INSERT INTO todos (name, tasklist_id) VALUES (?, ?)', [name, tasklist_id], function (error) {
         if (error) {
            console.error(error);
            return;
         }
         const todo = { id: this.lastID, name, tasklist_id };
         io.emit('todoAdded', todo);
      });
   });

   socket.on('deleteTodo', ({ id }) => {
      database.run('DELETE FROM todos WHERE id = ?', [id], (error) => {
         if (error) {
            console.error(error);
            return;
         }
         io.emit('todoDeleted', id);
      });
   });
});

server.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});
