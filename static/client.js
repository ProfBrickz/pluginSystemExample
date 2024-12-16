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

function addTask(event) {
   event.preventDefault();
   const name = event.target.name.value;
   const tasklist_id = event.target.tasklist_id.value;
   socket.emit('addTask', { name, tasklist_id });
   event.target.name.value = '';
}

function deleteTask(id) {
   socket.emit('deleteTask', { id });
}

socket.on('taskAdded', (task) => {
   const tasklist = document.getElementById('task-list');
   const li = document.createElement('li');
   li.dataset.id = task.id;
   li.innerHTML = `${task.name} <button onclick="deleteTask('${task.id}')">Delete</button>`;
   tasklist.appendChild(li);
});

socket.on('taskDeleted', (id) => {
   const taskItem = document.querySelector(`li[data-id="${id}"]`);
   if (taskItem) {
      taskItem.remove();
   }
});
