// Initialisation des listes de tâches à partir du localStorage ou vide
let lists = JSON.parse(localStorage.getItem('todoLists')) || {};

// Fonction pour sauvegarder les listes dans le localStorage
function saveToLocalStorage() {
  localStorage.setItem('todoLists', JSON.stringify(lists));
}

// Afficher toutes les listes
function renderLists() {
  const listsContainer = document.getElementById('listsContainer');
  listsContainer.innerHTML = '';

  for (const [listName, tasks] of Object.entries(lists)) {
    const listDiv = document.createElement('div');
    listDiv.classList.add('list');
    
    // Affichage du nom de la liste
    const title = document.createElement('h3');
    title.textContent = listName;

    // Bouton pour supprimer la liste
    const deleteListBtn = document.createElement('button');
    deleteListBtn.textContent = 'Supprimer la liste';
    deleteListBtn.onclick = () => {
      delete lists[listName];
      saveToLocalStorage();
      renderLists();
    };

    // Affichage des tâches
    const tasksDiv = document.createElement('div');
    tasks.forEach((task, index) => {
      const taskDiv = document.createElement('div');
      taskDiv.classList.add('task');
      if (task.completed) taskDiv.classList.add('completed');
      
      const taskText = document.createElement('span');
      taskText.textContent = `${task.name} - ${task.date}`;

      // Marquer la tâche comme terminée
      const completeTaskBtn = document.createElement('button');
      completeTaskBtn.textContent = task.completed ? 'Non terminée' : 'Terminée';
      completeTaskBtn.onclick = () => {
        task.completed = !task.completed;
        saveToLocalStorage();
        renderLists();
      };

      // Modifier une tâche
      const editTaskBtn = document.createElement('button');
      editTaskBtn.textContent = 'Modifier';
      editTaskBtn.onclick = () => {
        const newName = prompt('Nom de la tâche:', task.name);
        const newDate = prompt('Date de la tâche:', task.date);
        if (newName) task.name = newName;
        if (newDate) task.date = newDate;
        saveToLocalStorage();
        renderLists();
      };

      // Supprimer une tâche
      const deleteTaskBtn = document.createElement('button');
      deleteTaskBtn.textContent = 'Supprimer';
      deleteTaskBtn.onclick = () => {
        tasks.splice(index, 1);
        saveToLocalStorage();
        renderLists();
      };

      taskDiv.append(taskText, completeTaskBtn, editTaskBtn, deleteTaskBtn);
      tasksDiv.appendChild(taskDiv);
    });

    // Formulaire pour ajouter une tâche
    const addTaskForm = document.createElement('form');
    addTaskForm.onsubmit = (e) => {
      e.preventDefault();
      const taskName = addTaskForm.querySelector('.taskName').value;
      const taskDate = addTaskForm.querySelector('.taskDate').value;
      tasks.push({ name: taskName, date: taskDate, completed: false });
      saveToLocalStorage();
      renderLists();
    };

    const taskNameInput = document.createElement('input');
    taskNameInput.className = 'taskName';
    taskNameInput.placeholder = 'Nom de la tâche';
    taskNameInput.required = true;

    const taskDateInput = document.createElement('input');
    taskDateInput.className = 'taskDate';
    taskDateInput.placeholder = 'Date de la tâche';
    taskDateInput.type = 'date';
    taskDateInput.required = true;

    const addTaskBtn = document.createElement('button');
    addTaskBtn.textContent = 'Ajouter la tâche';

    addTaskForm.append(taskNameInput, taskDateInput, addTaskBtn);
    listDiv.append(title, deleteListBtn, tasksDiv, addTaskForm);
    listsContainer.appendChild(listDiv);
  }
}

// Ajouter une nouvelle liste
document.getElementById('addListForm').onsubmit = (e) => {
  e.preventDefault();
  const listName = document.getElementById('listName').value;
  if (!lists[listName]) {
    lists[listName] = [];
    saveToLocalStorage();
    renderLists();
    e.target.reset();
  } else {
    alert('Cette liste existe déjà !');
  }
};

// Exporter les listes en CSV
function exportToCSV() {
  const csvContent = Object.entries(lists)
    .map(([listName, tasks]) => tasks
      .map(task => `${listName},${task.name},${task.date},${task.completed}`)
      .join('\n'))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'todo_lists.csv';
  link.click();
  URL.revokeObjectURL(url);
}

// Importer les listes depuis un fichier CSV
document.getElementById('importCSV').onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target.result.split('\n');
      csvContent.forEach(line => {
        const [listName, taskName, taskDate, completed] = line.split(',');
        if (listName && taskName) {
          if (!lists[listName]) lists[listName] = [];
          lists[listName].push({ name: taskName, date: taskDate, completed: completed === 'true' });
        }
      });
      saveToLocalStorage();
      renderLists();
    };
    reader.readAsText(file);
  }
};

// Initial render
renderLists();