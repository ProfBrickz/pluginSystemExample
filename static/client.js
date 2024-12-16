const socket = io();

function addTasklist(event) {
   event.preventDefault();
   const name = event.target.name.value;
   socket.emit('addTasklist', { name });
   event.target.name.value = '';
}

function deleteTasklist(id) {
   socket.emit('deleteTasklist', { id });
}

socket.on('tasklistAdded', (tasklist) => {
   const tasklistList = document.getElementById('tasklist-list');
   const li = document.createElement('li');
   li.dataset.id = tasklist.id;
   li.innerHTML = `<h2><a href="/tasklist/${tasklist.id}">${tasklist.name}</a></h2> <button onclick="deleteTasklist('${tasklist.id}')">Delete</button>`;
   tasklistList.appendChild(li);
});

socket.on('tasklistDeleted', (id) => {
   const tasklistItem = document.querySelector(`li[data-id="${id}"]`);
   if (tasklistItem) {
      tasklistItem.remove();
   }
});

function addTodo(event) {
   event.preventDefault();
   const name = event.target.name.value;
   const tasklist_id = event.target.tasklist_id.value;
   socket.emit('addTodo', { name, tasklist_id });
   event.target.name.value = '';
}

function deleteTodo(id) {
   socket.emit('deleteTodo', { id });
}

socket.on('todoAdded', (todo) => {
   const todoList = document.getElementById('todo-list');
   const li = document.createElement('li');
   li.dataset.id = todo.id;
   li.innerHTML = `${todo.name} <button onclick="deleteTodo('${todo.id}')">Delete</button>`;
   todoList.appendChild(li);
});

socket.on('todoDeleted', (id) => {
   const todoItem = document.querySelector(`li[data-id="${id}"]`);
   if (todoItem) {
      todoItem.remove();
   }
});
