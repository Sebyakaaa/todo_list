const addTaskBtn = document.querySelector('.add-new__btn');
const taskInput = document.querySelector('.add-new__field');
const taskList = document.querySelector('.task-list');

const TASK_ITEM = 'task-list__item';
const CHECKBOX_CTRL = 'checkbox__control';
const DELETE_BTN = 'task-list__delete';

// Функция для генерации случайного ID
function generateId() {
  return Math.floor(Math.random() * 1000000);
}

// Функция создания для новой задачи
function createTaskItem(taskText, taskId) {
  return `
    <li class="${TASK_ITEM}" data-id="${taskId}">
      <div class="task-list__unit">
        <div class="checkbox">
          <input class="${CHECKBOX_CTRL}" type="checkbox">
          <label class="checkbox__label"></label>
        </div>
        <span contenteditable="true" class="task-list__text">${taskText}</span>
      </div>  
      <button class="${DELETE_BTN}" type="button"></button>
    </li>
  `;
}

// Обработчик добавления задачи
addTaskBtn.addEventListener('click', () => {
  const taskText = taskInput.value.trim();

  if (taskText !== '') {
    const taskId = generateId();
    const taskItem = createTaskItem(taskText, taskId);

    taskList.insertAdjacentHTML('beforeend', taskItem);

    taskInput.value = '';
  }
});

taskList.addEventListener('click', (event) => {
  // Удаление задачи
  if (event.target.closest(`.${DELETE_BTN}`)) {
    const taskItem = event.target.closest(`.${TASK_ITEM}`);
    taskItem.remove();
  }

  // Обработка клика по чекбоксу
  if (event.target.classList.contains(CHECKBOX_CTRL)) {
    const taskItem = event.target.closest(`.${TASK_ITEM}`);

    if (event.target.checked) {
      taskItem.classList.add('completed');
    } else {
      taskItem.classList.remove('completed');
    }
  }
});