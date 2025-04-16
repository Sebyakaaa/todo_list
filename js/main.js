const addTaskBtn = document.querySelector('.add-new__btn');
const taskInput = document.querySelector('.add-new__field');
const taskList = document.querySelector('.task-list');
const loader = document.querySelector('.loader');

const TASK_ITEM = 'task-list__item';
const CHECKBOX_CTRL = 'checkbox__control';
const TASK_TEXT = 'task-list__text';
const DELETE_BTN = 'task-list__delete';

// Функция для генерации случайного ID
// function generateId() {
//   return Math.floor(Math.random() * 1000000);
// }

function showLoader() {
  loader.hidden = false;
}

function hideLoader() {
  loader.hidden = true;
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

// Добавление задачи
addTaskBtn.addEventListener('click', async () => {
  const taskText = taskInput.value.trim();
  if (!taskText) return;   // if (taskText !== '') {}

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

    // Рендерим новый todo
    const taskItem = createTaskItem(newTodo.todo, newTodo.id, newTodo.completed);
    taskList.insertAdjacentHTML('afterbegin', taskItem); // добавление в начало
    taskInput.value = '';
  } catch (error) {
    console.error('Can not add an item', error);
  } finally {
    hideLoader();
    addTaskBtn.disabled = false;
  }
});

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

taskList.addEventListener('click', handleCheckboxClick);
taskList.addEventListener('click', handleDeleteClick);

// Апдейт текста задачи
// Event Capturing
taskList.addEventListener('blur', async (event) => {
  if (event.target.classList.contains(TASK_TEXT)) {
    const taskItem = event.target.closest(`.${TASK_ITEM}`);
    const taskId = taskItem.dataset.id;
    const newText = event.target.textContent.trim(); // textContent возвращает текст внутри элемента, который отредактировал юзер

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
}, true); // true (включает режим захвата) чтобы обработчик увидел blur

// Функция для загрузки задач с сервера
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

// Вызов функции при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  loadTodosFromAPI();
});
