// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, deleteTask } from "./utils/taskFunctions";
// TASK: import initialData
import { initialData } from "./initialData";


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  headerBoardName: document.getElementById('header-board-name'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  createNewTaskBtn: document.getElementById('create-task-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  filterDiv: document.getElementById('filterDiv'),
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  themeSwitch: document.getElementById('switch'),
  columnDivs: document.querySelectorAll('.column-div'),
  logo: document.getElementById('logo'), 

};

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard || boards [0];  //? localStorageBoard :  boards[0]; "defaultBoardName";//changed :
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    //refreshTasksUI();
    filterAndDisplayTasksByBoard(activeBoard);//added function to display active board
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    
    boardElement.addEventListener("click",() => {    //changed eventlistener click"
      elements.headerBoardName.textContent = board;
      //filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
      filterAndDisplayTasksByBoard(board);//moved
    });
    boardsContainer.appendChild(boardElement);
  });

}/// ADD FUNCTION TO INITIALIZE TITLES

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);// changed = to ===

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {// changed = to === 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.click = () => { //changed to ".click = () =>"
        openEditTaskModal(task);
      };

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { //changed 'forEach'
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') //changed classlist call method
    }
    else {
      btn.classList.remove('active'); //changed call method to 'classlistremove'
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); //coorected backtick for literal template
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); //taskElement added for argumet/html element
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.click = () => toggleModal(false, elements.editTaskModal);// added = to create onclick

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.click = () => toggleSidebar(false);//corrected syntax onclick '='
  elements.showSideBarBtn.click = () => toggleSidebar(true);//corrected syntax onclick

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; // changed => to : for ternary
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
 
}

function toggleTheme() {
 
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  

  // Get button elements from the task modal


  // Call saveTaskChanges upon click of Save Changes button
 

  // Delete task using a helper function and close the task modal


  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  

  // Create an object with the updated task details


  // Update task using a hlper functoin
 

  // Close the modal and refresh the UI to reflect the changes

  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}