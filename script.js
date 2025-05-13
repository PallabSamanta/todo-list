const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date-input');
const categorySelect = document.getElementById('category-select');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let darkMode = localStorage.getItem('darkMode') === 'true';

// Initialize dark mode
function initDarkMode() {
  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.textContent = '☀️';
    themeToggle.querySelector('span:last-child').textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.textContent = '🌙';
    themeToggle.querySelector('span:last-child').textContent = '🌙';
  }
}

// Toggle dark mode
themeToggle.addEventListener('click', () => {
  darkMode = !darkMode;
  localStorage.setItem('darkMode', darkMode);
  initDarkMode();
});

// Initialize
initDarkMode();

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.setAttribute('draggable', 'true');
    li.dataset.index = index;
    if (task.completed) {
      li.classList.add('completed');
      if (!task.completionDate) {
        task.completionDate = new Date().toISOString().split('T')[0];
        saveTasks();
      }
    }

    li.innerHTML = `
      <div class="task-content">
        <span class="task-text">${task.text}</span>
        <div class="task-meta">
          ${task.dueDate ? `<span class="due-date">📅 ${formatDate(task.dueDate)}</span>` : ''}
          ${task.completionDate ? `<span class="completed-date">✅ ${formatDate(task.completionDate)}</span>` : ''}
          ${task.category ? `<span class="task-category" style="background-color: ${getCategoryColor(task.category)}">${task.category}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        ${task.completed ? `<button class="restore-btn">↩️ Restore</button>` : ''}
        <button class="delete-btn">🗑️ Delete</button>
      </div>
    `;

    // Toggle complete
    li.addEventListener('click', (e) => {
      if (!e.target.classList.contains('delete-btn') && 
          !e.target.classList.contains('restore-btn') && 
          !e.target.classList.contains('task-text')) {
        task.completed = !task.completed;
        if (task.completed) {
          task.completionDate = new Date().toISOString().split('T')[0];
        } else {
          task.completionDate = null;
        }
        saveTasks();
        renderTasks();
      }
    });

    // Restore task
    const restoreBtn = li.querySelector('.restore-btn');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        task.completed = false;
        task.completionDate = null;
        saveTasks();
        renderTasks();
      });
    }

    // Edit task on double click
    const taskTextElement = li.querySelector('.task-text');
    taskTextElement.addEventListener('dblclick', () => {
      const currentText = task.text;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'edit-input';
      input.value = currentText;
      
      taskTextElement.replaceWith(input);
      input.focus();
      
      input.addEventListener('blur', () => {
        const newText = input.value.trim();
        if (newText && newText !== currentText) {
          task.text = newText;
          saveTasks();
        }
        renderTasks();
      });
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          input.blur();
        }
      });
    });

    // Delete task
    li.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    // Drag and drop functionality
    li.addEventListener('dragstart', (e) => {
      li.classList.add('dragging');
      e.dataTransfer.setData('text/plain', index);
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      li.classList.add('drag-over');
    });

    li.addEventListener('dragleave', () => {
      li.classList.remove('drag-over');
    });

    li.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const toIndex = parseInt(li.dataset.index);

      if (fromIndex === toIndex) return;

      const movedTask = tasks.splice(fromIndex, 1)[0];
      tasks.splice(toIndex, 0, movedTask);

      saveTasks();
      renderTasks();
    });

    li.addEventListener('dragend', () => {
      document.querySelectorAll('li').forEach(item => {
        item.classList.remove('dragging', 'drag-over');
      });
    });

    taskList.appendChild(li);
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getCategoryColor(category) {
  const colors = {
    work: '#4a6fa5',
    personal: '#6a4a8c',
    shopping: '#4a8c6e',
    health: '#c74a4a',
    other: '#8c6e4a'
  };
  return colors[category] || '#6c757d';
}

// Add task
addBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const category = categorySelect.value;
  
  if (text === '') return;

  tasks.push({ 
    text, 
    dueDate: dueDate || null, 
    category: category || null, 
    completed: false,
    completionDate: null
  });
  
  saveTasks();
  renderTasks();

  taskInput.value = '';
  dueDateInput.value = '';
  categorySelect.value = '';
  taskInput.focus();
});

// Allow adding task with Enter key
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addBtn.click();
  }
});

// Set today's date as default
dueDateInput.valueAsDate = new Date();

// Initial render
renderTasks();