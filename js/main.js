const addTaskBtn = document.querySelector('.add-new__btn');
const taskInput = document.querySelector('.add-new__field');
const taskList = document.querySelector('.task-list');
const loader = document.querySelector('.loader');

const TASK_ITEM = 'task-list__item';
const CHECKBOX_CTRL = 'checkbox__control';
const TASK_TEXT = 'task-list__text';
const DELETE_BTN = 'task-list__delete';

function showLoader() {
  loader.hidden = false;
}

function hideLoader() {
  loader.hidden = true;
}

// загрузка задач с сервера
async function loadTodosFromAPI() {
  showLoader();

  try {
    const response = await fetch('https://dummyjson.com/todos');
    const data = await response.json();
    const todos = data.todos;

    todos.forEach(todo => {
      const taskItem = createTaskItem(todo.todo, todo.id, todo.completed);
      taskList.insertAdjacentHTML('beforeend', taskItem); // добавление в конец
    });
  } catch (error) {
    console.error('Loading error', error);
  } finally {
    hideLoader();
  }
}

// Отображение списка задач
function createTaskItem(taskText, taskId, isCompleted = false) {
  const completedClass = isCompleted ? 'completed' : '';
  const checkedAttribute = isCompleted ? 'checked' : '';
  
  return `
    <li class="${TASK_ITEM} ${completedClass}" data-id="${taskId}">
      <div class="task-list__unit">
        <div class="checkbox">
          <input class="${CHECKBOX_CTRL}" type="checkbox" ${checkedAttribute}>
          <label class="checkbox__label"></label>
        </div>
        <span contenteditable="true" class="task-list__text">${taskText}</span>
      </div>  
      <button class="${DELETE_BTN}" type="button"></button>
    </li>
  `;
}

// Добавление новой задачи
async function handleAddTaskClick(event) {
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  showLoader();
  addTaskBtn.disabled = true;

  try {
    const response = await fetch('https://dummyjson.com/todos/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        todo: taskText,
        completed: false,
        userId: 1 
      })
    });

    const newTodo = await response.json();
    
    renderTaskItem(newTodo);

    taskInput.value = '';
  } catch (error) {
    console.error('Can not add an item', error);
  } finally {
    hideLoader();
    addTaskBtn.disabled = false;
  }
}

//отображение новой задачи в списке
async function renderTaskItem(newTodo) {
    const taskItem = createTaskItem(newTodo.todo, newTodo.id, newTodo.completed);
    taskList.insertAdjacentHTML('afterbegin', taskItem);
}

// Комплит задачи
async function handleCheckboxClick(event) {
  if (event.target.classList.contains(CHECKBOX_CTRL)) {
    const checkbox = event.target;
    const taskItem = checkbox.closest(`.${TASK_ITEM}`);
    const taskId = taskItem.dataset.id;

    if (!taskId) return;

    const isChecked = checkbox.checked;

    taskItem.classList.toggle('completed', isChecked);

    try {
      const response = await fetch(`https://dummyjson.com/todos/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: isChecked })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      alert('Failed to update checkbox status');
      console.error(error);
    }
  }
}

// Апдейт текста задачи
async function handleTaskEditBlur(event) {
  if (event.target.classList.contains(TASK_TEXT)) {
    const taskItem = event.target.closest(`.${TASK_ITEM}`);
    const taskId = taskItem.dataset.id;
    const newText = event.target.textContent.trim();

    if (!taskId) return;

    try {
      const response = await fetch(`https://dummyjson.com/todos/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ todo: newText })
      });

      if (!response.ok) {
        throw new Error('Failed to update task text');
      }

    } catch (error) {
      alert('Failed to update task text');
      console.error(error);
    }
  }
}

// удаление задачи
async function handleDeleteClick(event) {
  if (event.target.classList.contains(DELETE_BTN)) { 
    const taskItem = event.target.closest(`.${TASK_ITEM}`);
    const taskId = taskItem.dataset.id;

    if (!taskId) return;

    const userConfirm = confirm('Do you want to delete this item?');
    if (!userConfirm) return;

    showLoader();
    taskItem.remove();

    try {
      const response = await fetch(`https://dummyjson.com/todos/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      alert('Deletion error');
      console.error(error);
    } finally {
      hideLoader();
    }
  }
}

function registerEventListeners() {
  addTaskBtn.addEventListener('click', handleAddTaskClick);
  taskList.addEventListener('click', handleCheckboxClick);
  taskList.addEventListener('blur', handleTaskEditBlur, true);
  taskList.addEventListener('click', handleDeleteClick);
}

function removeEventListeners() {
  addTaskBtn.removeEventListener('click', handleAddTaskClick);
  taskList.removeEventListener('click', handleCheckboxClick);
  taskList.removeEventListener('blur', handleTaskEditBlur, true);
  taskList.removeEventListener('click', handleDeleteClick);
}

// Подписка при загрузке
document.addEventListener('DOMContentLoaded', () => {
  loadTodosFromAPI();
  registerEventListeners();
});

// Отписка при закрытии/обновлении страницы
window.addEventListener('beforeunload', () => {
  removeEventListeners();
});