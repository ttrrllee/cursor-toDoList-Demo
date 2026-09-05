const STORAGE_KEY = "taeran-todos";

const form = document.getElementById("todoForm");
const input = document.getElementById("todoInput");
const list = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const countLabel = document.getElementById("countLabel");
const dateLabel = document.getElementById("dateLabel");
const filterButtons = document.querySelectorAll(".filter");

let todos = loadTodos();
let currentFilter = "all";

dateLabel.textContent = new Intl.DateTimeFormat("ko-KR", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.unshift({
    id: createId(),
    text,
    done: false,
  });
  input.value = "";
  persistAndRender();
});

list.addEventListener("click", (event) => {
  const item = event.target.closest(".todo-item");
  if (!item) return;

  const id = item.dataset.id;

  if (event.target.closest(".check")) {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
    persistAndRender();
    return;
  }

  if (event.target.closest(".delete")) {
    todos = todos.filter((todo) => todo.id !== id);
    persistAndRender();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((node) => node.classList.toggle("is-active", node === button));
    render();
  });
});

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  render();
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function render() {
  const visible = todos.filter((todo) => {
    if (currentFilter === "active") return !todo.done;
    if (currentFilter === "completed") return todo.done;
    return true;
  });

  const remaining = todos.filter((todo) => !todo.done).length;
  countLabel.textContent = `남은 할 일 ${remaining}개`;

  emptyState.classList.toggle("is-visible", visible.length === 0);
  emptyState.textContent =
    todos.length === 0
      ? "아직 할 일이 없어요. 위에서 추가해 보세요."
      : "이 필터에 해당하는 할 일이 없어요.";

  list.innerHTML = visible
    .map(
      (todo) => `
        <li class="todo-item${todo.done ? " is-done" : ""}" data-id="${todo.id}">
          <button class="check" type="button" aria-label="${todo.done ? "완료 해제" : "완료 표시"}">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6.2L4.6 9L10 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <p class="todo-text">${escapeHtml(todo.text)}</p>
          <button class="delete" type="button" aria-label="삭제">×</button>
        </li>
      `
    )
    .join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

render();
