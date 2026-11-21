import { recordService } from "./data.js";

const form = document.querySelector("#record-form");
const titleInput = document.querySelector("#title");
const categoryInput = document.querySelector("#category");
const descriptionInput = document.querySelector("#description");
const statusInput = document.querySelector("#status");
const submitButton = document.querySelector("#submit-button");
const cancelEditButton = document.querySelector("#cancel-edit");
const searchInput = document.querySelector("#search");
const statusFilter = document.querySelector("#status-filter");
const recordList = document.querySelector("#record-list");
const recordCount = document.querySelector("#record-count");
const message = document.querySelector("#message");

let editingId = null;
let allRecords = [];

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function clearMessage() {
  message.textContent = "";
  message.classList.remove("error");
}

function resetForm() {
  form.reset();
  statusInput.value = "Pending";
  editingId = null;
  submitButton.textContent = "Add request";
  cancelEditButton.hidden = true;
  document.querySelector("#form-heading").textContent = "Add a request";
}

function getValidatedValues() {
  const values = {
    title: titleInput.value.trim(),
    category: categoryInput.value.trim(),
    description: descriptionInput.value.trim(),
    status: statusInput.value
  };

  if (values.title.length < 3 || values.title.length > 80) {
    throw new Error("Title must be between 3 and 80 characters.");
  }

  if (values.category.length < 2 || values.category.length > 40) {
    throw new Error("Choose a valid category.");
  }

  if (values.description.length < 5 || values.description.length > 300) {
    throw new Error("Description must be between 5 and 300 characters.");
  }

  const allowedStatuses = ["Pending", "In progress", "Completed"];
  if (!allowedStatuses.includes(values.status)) {
    throw new Error("Choose a valid status.");
  }

  return values;
}

function makeButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function renderRecords() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const visibleRecords = allRecords.filter((record) => {
    const matchesTitle = record.title.toLowerCase().includes(searchTerm);
    const matchesStatus =
      selectedStatus === "All" || record.status === selectedStatus;

    return matchesTitle && matchesStatus;
  });

  recordList.replaceChildren();
  recordCount.textContent =
    `${visibleRecords.length} ${visibleRecords.length === 1 ? "request" : "requests"} shown`;

  if (visibleRecords.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = allRecords.length === 0
      ? "There are no requests yet. Add the first one using the form."
      : "No requests match your search and status filter.";
    recordList.append(empty);
    return;
  }

  for (const record of visibleRecords) {
    const card = document.createElement("article");
    card.className = "record-card";

    const title = document.createElement("h4");
    title.textContent = record.title;

    const category = document.createElement("p");
    category.className = "record-meta";
    category.textContent = `Category: ${record.category}`;

    const description = document.createElement("p");
    description.textContent = record.description;

    const status = document.createElement("span");
    status.className = "status-badge";
    status.textContent = record.status;

    const actions = document.createElement("div");
    actions.className = "button-row";

    actions.append(
      makeButton("View", "button button-secondary button-small", () => {
        alert(
          `Request #${record.id}\n\n` +
          `Title: ${record.title}\n` +
          `Category: ${record.category}\n` +
          `Description: ${record.description}\n` +
          `Status: ${record.status}`
        );
      }),

      makeButton("Edit", "button button-secondary button-small", () => {
        titleInput.value = record.title;
        categoryInput.value = record.category;
        descriptionInput.value = record.description;
        statusInput.value = record.status;
        editingId = record.id;
        submitButton.textContent = "Save changes";
        cancelEditButton.hidden = false;
        document.querySelector("#form-heading").textContent = "Edit request";
        clearMessage();
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        titleInput.focus();
      }),

      makeButton("Delete", "button button-danger button-small", async () => {
        const confirmed = confirm(
          `Delete "${record.title}"? This cannot be undone.`
        );

        if (!confirmed) {
          showMessage("Delete cancelled. The request is still saved.");
          return;
        }

        try {
          await recordService.remove(record.id);
          await loadRecords();
          showMessage("Request deleted.");
          if (editingId === record.id) resetForm();
        } catch (error) {
          showMessage(error.message, true);
        }
      })
    );

    card.append(title, category, description, status, actions);
    recordList.append(card);
  }
}

async function loadRecords() {
  allRecords = await recordService.list();
  renderRecords();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  try {
    const values = getValidatedValues();

    if (editingId === null) {
      await recordService.create(values);
      showMessage("Request added successfully.");
    } else {
      await recordService.update(editingId, values);
      showMessage("Request updated successfully. Its ID has been kept.");
    }

    resetForm();
    await loadRecords();
  } catch (error) {
    showMessage(error.message, true);
  }
});

cancelEditButton.addEventListener("click", () => {
  resetForm();
  showMessage("Edit cancelled.");
});

searchInput.addEventListener("input", renderRecords);
statusFilter.addEventListener("change", renderRecords);

loadRecords().catch((error) => {
  showMessage(`Could not load requests: ${error.message}`, true);
});