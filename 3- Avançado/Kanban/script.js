
// Estado global
let selectedPriority = "";
let selectedAvatar = "";
let currentColumnTarget = null;
let cardToDelete = null;
let cardBeingEdited = null;
let editSelectedPriority = "";
let editSelectedAvatar = "";

/* ============================
   Ajudas
   ============================ */

// Cria o HTML padrão do menu (ellipsis + opções editar/excluir)
function menuHtml() {
  return `
    <div class="btn-ellip">
      <button aria-label="Abrir menu"><i class="fa-solid fa-ellipsis"></i></button>
      <div class="btn-edit" style="display:none;">
        <button aria-label="Editar"><i class="fa-solid fa-pencil"></i></button>
        <button aria-label="Excluir"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    </div>
  `;
}

// Monta um elemento de card consistente com a estrutura esperada
function createCardElement({ badgeHTML, titleText, iconsHTML, userHTML }) {
  const card = document.createElement("div");
  card.classList.add("kanban-card");
  card.setAttribute("draggable", "true");

  card.innerHTML = `
    <div class="badge-row">
      ${badgeHTML}
      ${menuHtml()}
    </div>
    <p class="card-title">${titleText}</p>
    <div class="card-infos">
      ${iconsHTML}
      ${userHTML}
    </div>
  `;

  return card;
}

// Cria badge HTML a partir da prioridade
function makeBadgeHTML(priority) {
  const cls = priority === "alta" ? "high" : priority === "media" ? "medium" : "low";
  const label = priority.charAt(0).toUpperCase() + priority.slice(1) + " prioridade";
  return `<div class="badge ${cls}"><span>${label}</span></div>`;
}

/* ============================
   DRAG & DROP (delegado)
   ============================ */

document.addEventListener("dragstart", (e) => {
  const card = e.target.closest(".kanban-card");
  if (card) card.classList.add("dragging");
});

document.addEventListener("dragend", (e) => {
  const card = e.target.closest(".kanban-card");
  if (card) card.classList.remove("dragging");
});

document.querySelectorAll(".kanban-cards").forEach((column) => {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if (!dragging) return;
    const afterElement = getDragAfterElement(column, e.clientY);
    if (afterElement == null) column.appendChild(dragging);
    else column.insertBefore(dragging, afterElement);
    column.classList.add("cards-hover");
  });

  column.addEventListener("dragleave", (e) => {
    column.classList.remove("cards-hover");
  });

  column.addEventListener("drop", (e) => {
    column.classList.remove("cards-hover");
    saveBoard();
  });
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".kanban-card:not(.dragging)")];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

/* ============================
   MENU (ellipsis) TOGGLE + EDIT/DELETE HANDLERS
   ============================ */

// Toggle do menu (três pontos). Delegado.
document.addEventListener("click", (e) => {
  const toggleBtn = e.target.closest(".btn-ellip > button");
  if (toggleBtn) {
    // Fecha todos os menus primeiro
    document.querySelectorAll(".btn-edit").forEach((m) => (m.style.display = "none"));
    const menu = toggleBtn.parentElement.querySelector(".btn-edit");
    if (!menu) return;
    menu.style.display = menu.style.display === "block" ? "none" : "block";
    return;
  }

  // Clique fora fecha todos os menus
  if (!e.target.closest(".btn-ellip")) {
    document.querySelectorAll(".btn-edit").forEach((m) => (m.style.display = "none"));
  }
});

// Delegado: detectar clique nas opções de editar/excluir dentro do menu
document.addEventListener("click", (e) => {
  const menuBtn = e.target.closest(".btn-edit button");
  if (!menuBtn) return;
  const icon = menuBtn.querySelector("i");
  const card = menuBtn.closest(".kanban-card");
  if (!icon || !card) return;

  // Se for editar (ícone lápis)
  if (icon.classList.contains("fa-pencil") || icon.classList.contains("fa-pen")) {
    openEditModal(card);
    // fecha menu
    menuBtn.closest(".btn-edit").style.display = "none";
    return;
  }

  // Se for excluir (ícone lixeira) — abre modal de confirmação
  if (icon.classList.contains("fa-trash-can")) {
    cardToDelete = card;
    const delModal = document.getElementById("deleteConfirmModal");
    if (delModal) delModal.style.display = "flex";
    // fecha menu
    menuBtn.closest(".btn-edit").style.display = "none";
    return;
  }
});

/* ============================
   ABRIR / FECHAR MODAIS e PRE-PREENCHER EDIT
   ============================ */

function openEditModal(card) {
  cardBeingEdited = card;

  const editModal = document.getElementById("editCardModal");
  if (!editModal) return;

  // pega o form que está DENTRO do modal (isso evita pegar o form do novo card)
  const editForm = editModal.querySelector("form");
  if (!editForm) return;

  // preencher campos do form de edição usando querySelector dentro do modal
  const titleEl = card.querySelector(".card-title");
  const commentP = card.querySelector(".card-icons p .fa-regular.fa-comment")
    ? card.querySelector(".card-icons p").closest("p") // fallback
    : null;

  // Melhor extrair pelo texto (segurança)
  const pIcons = [...card.querySelectorAll(".card-icons p")];
  const commentPnode = pIcons.find((p) => p.querySelector(".fa-regular.fa-comment"));
  const attachPnode = pIcons.find((p) => p.querySelector(".fa-solid.fa-paperclip"));

  editForm.querySelector("#taskTitle").value = titleEl ? titleEl.innerText.trim() : "";
  editForm.querySelector("#taskComments").value = commentPnode ? (commentPnode.innerText.match(/\d+/)?.[0] || "0") : "0";
  editForm.querySelector("#taskAttachments").value = attachPnode ? (attachPnode.innerText.match(/\d+/)?.[0] || "0") : "0";

  // avatar
  const avatarImg = card.querySelector(".user img");
  editSelectedAvatar = avatarImg ? (avatarImg.getAttribute("src") || avatarImg.src) : "";
  // prioridade obtida pela classe da badge
  const badge = card.querySelector(".badge");
  if (badge?.classList.contains("high")) editSelectedPriority = "alta";
  else if (badge?.classList.contains("medium")) editSelectedPriority = "media";
  else editSelectedPriority = "baixa";

  // marcar controles dentro do modal de edição (escopado)
  editForm.querySelectorAll(".priority-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.priority === editSelectedPriority);
  });
  editForm.querySelectorAll(".avatar-option").forEach((img) => {
    img.classList.toggle("selected", (img.getAttribute("src") || img.src) === editSelectedAvatar);
  });

  editModal.style.display = "flex";
}

// fechar modal (delegado: X ou overlay)
document.addEventListener("click", (e) => {
  // novo card modal
  if (e.target.closest("#newCardModal .close-modal") || e.target.id === "newCardModal") {
    const m = document.getElementById("newCardModal");
    if (m) {
      m.style.display = "none";
      resetCreateModal();
    }
  }
  // edit card modal
  if (e.target.closest("#editCardModal .close-modal") || e.target.id === "editCardModal") {
    const m = document.getElementById("editCardModal");
    if (m) {
      m.style.display = "none";
      resetEditModal();
      cardBeingEdited = null;
    }
  }
  // delete modal close
  if (e.target.closest("#deleteConfirmModal .close-delete-modal") || e.target.id === "deleteConfirmModal") {
    const m = document.getElementById("deleteConfirmModal");
    if (m) m.style.display = "none";
    cardToDelete = null;
  }
});

/* ============================
   SELEÇÃO PRIORIDADE / AVATAR (escopada por modal)
   ============================ */

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".priority-btn");
  if (!btn) return;
  // descobrir em qual modal/form o botão está (novo vs edit)
  const modal = btn.closest(".modal");
  if (!modal) return;

  // limpa apenas os botões daquele modal
  modal.querySelectorAll(".priority-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  const p = btn.dataset.priority; // 'alta' | 'media' | 'baixa'
  if (modal.id === "newCardModal") selectedPriority = p;
  else if (modal.id === "editCardModal") editSelectedPriority = p;
});

document.addEventListener("click", (e) => {
  const img = e.target.closest(".avatar-option");
  if (!img) return;
  const modal = img.closest(".modal");
  if (!modal) return;

  modal.querySelectorAll(".avatar-option").forEach((i) => i.classList.remove("selected"));
  img.classList.add("selected");

  const src = img.getAttribute("src") || img.src;
  if (modal.id === "newCardModal") selectedAvatar = src;
  else if (modal.id === "editCardModal") editSelectedAvatar = src;
});

/* ============================
   SUBMIT (CRIAR / EDITAR) - UNICO HANDLER (delegado)
   - usa form.closest('.modal') para decidir qual action
   ============================ */

document.addEventListener("submit", (e) => {
  const form = e.target;
  const modal = form.closest(".modal");
  if (!modal) return; // não é um form de nossos modais

  e.preventDefault();

  // --------- CRIAR NOVO CARD -----------
  if (modal.id === "newCardModal") {
    // validações
    if (!selectedPriority) {
      alert("Selecione uma prioridade!");
      return;
    }
    if (!selectedAvatar) {
      alert("Selecione um avatar!");
      return;
    }
    if (!currentColumnTarget) {
      alert("Coluna de destino não encontrada.");
      return;
    }

    const title = form.querySelector("#taskTitle").value.trim() || "Nova tarefa";
    const comments = form.querySelector("#taskComments").value || "0";
    const attachments = form.querySelector("#taskAttachments").value || "0";

    const badgeHTML = makeBadgeHTML(selectedPriority);
    const iconsHTML = `
      <div class="card-icons">
        <p><i class="fa-regular fa-comment"></i> ${comments}</p>
        <p><i class="fa-solid fa-paperclip"></i> ${attachments}</p>
      </div>
    `;
    const userHTML = `<div class="user"><img src="${selectedAvatar}" alt="avatar" draggable="false"></div>`;

    const card = createCardElement({
      badgeHTML,
      titleText: title,
      iconsHTML,
      userHTML,
    });

    currentColumnTarget.appendChild(card);
    saveBoard();

    modal.style.display = "none";
    resetCreateModal();
    return;
  }

  // --------- EDITAR CARD -----------
  if (modal.id === "editCardModal") {
    if (!cardBeingEdited) {
      alert("Erro: card não encontrado para edição.");
      return;
    }

    const newTitle = form.querySelector("#taskTitle").value.trim() || "";
    const newComments = form.querySelector("#taskComments").value.trim() || "0";
    const newAttachments = form.querySelector("#taskAttachments").value.trim() || "0";

    // Título
    const titleEl = cardBeingEdited.querySelector(".card-title");
    if (titleEl) titleEl.innerText = newTitle;

    // Ícones (comentários/anexos)
    const pIcons = [...cardBeingEdited.querySelectorAll(".card-icons p")];
    const commentsEl = pIcons.find((p) => p.querySelector(".fa-regular.fa-comment"));
    const attachEl = pIcons.find((p) => p.querySelector(".fa-solid.fa-paperclip"));

    if (commentsEl) commentsEl.innerHTML = `<i class="fa-regular fa-comment"></i> ${newComments}`;
    if (attachEl) attachEl.innerHTML = `<i class="fa-solid fa-paperclip"></i> ${newAttachments}`;

    // Avatar
    const avatarImg = cardBeingEdited.querySelector(".user img");
    if (avatarImg && editSelectedAvatar) avatarImg.src = editSelectedAvatar;

    // Badge (prioridade) -- garantir que a classe seja atualizada
    const badge = cardBeingEdited.querySelector(".badge");
    if (badge) {
      badge.classList.remove("high", "medium", "low");
      const cls = editSelectedPriority === "alta" ? "high" : editSelectedPriority === "media" ? "medium" : "low";
      badge.classList.add(cls);
      badge.innerHTML = `<span>${editSelectedPriority.charAt(0).toUpperCase() + editSelectedPriority.slice(1)} prioridade</span>`;
    }

    saveBoard();

    modal.style.display = "none";
    resetEditModal();
    cardBeingEdited = null;
    return;
  }
});

/* ============================
   MODAL CREATE helpers
   ============================ */

function resetCreateModal() {
  const form = document.querySelector("#newCardModal form");
  if (form) form.reset();
  selectedPriority = "";
  selectedAvatar = "";
  document.querySelectorAll("#newCardModal .priority-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll("#newCardModal .avatar-option").forEach((i) => i.classList.remove("selected"));
}

/* ============================
   MODAL EDIT helpers
   ============================ */

function resetEditModal() {
  const form = document.querySelector("#editCardModal form");
  if (form) form.reset();
  editSelectedPriority = "";
  editSelectedAvatar = "";
  document.querySelectorAll("#editCardModal .priority-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll("#editCardModal .avatar-option").forEach((i) => i.classList.remove("selected"));
}

/* ============================
   DELETE CONFIRMATION
   ============================ */

document.querySelectorAll(".close-delete-modal").forEach((btn) => {
  btn?.addEventListener("click", () => {
    const m = document.getElementById("deleteConfirmModal");
    if (m) m.style.display = "none";
    cardToDelete = null;
  });
});

document.getElementById("cancelDelete")?.addEventListener("click", () => {
  const m = document.getElementById("deleteConfirmModal");
  if (m) m.style.display = "none";
  cardToDelete = null;
});

document.getElementById("confirmDelete")?.addEventListener("click", () => {
  if (cardToDelete) {
    cardToDelete.remove();
    saveBoard();
  }
  const m = document.getElementById("deleteConfirmModal");
  if (m) m.style.display = "none";
  cardToDelete = null;
});

/* ============================
   BOTÃO "+" ABRE O MODAL DE CRIAÇÃO
   ============================ */

document.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-card");
  if (!addBtn) return;
  currentColumnTarget = addBtn.closest(".kanban-column").querySelector(".kanban-cards");
  const m = document.getElementById("newCardModal");
  if (m) m.style.display = "flex";
});

/* ============================
   LOCALSTORAGE: salvar / carregar
   - armazenamos pedaços de outerHTML (badge/icons/user) + title
   - ao carregar, reconstrói cards com menu consistente
   ============================ */

function saveBoard() {
  const board = [];
  document.querySelectorAll(".kanban-column").forEach((column) => {
    const cards = [];
    column.querySelectorAll(".kanban-card").forEach((card) => {
      cards.push({
        badge: card.querySelector(".badge")?.outerHTML || "",
        title: card.querySelector(".card-title")?.innerText || "",
        icons: card.querySelector(".card-icons")?.outerHTML || "",
        user: card.querySelector(".user")?.outerHTML || "",
      });
    });
    board.push(cards);
  });
  localStorage.setItem("kanbanBoard", JSON.stringify(board));
}

function loadBoard() {
  let board;
  try {
    board = JSON.parse(localStorage.getItem("kanbanBoard"));
  } catch (e) {
    console.error("Erro ao carregar o board do localStorage:", e);
    board = null;
  }
  if (!board) return;
  document.querySelectorAll(".kanban-cards").forEach((column, index) => {
    column.innerHTML = "";
    const list = board[index] || [];
    list.forEach((cardData) => {
      const card = createCardElement({
        badgeHTML: cardData.badge || makeBadgeHTML("baixa"),
        titleText: cardData.title || "",
        iconsHTML:
          cardData.icons ||
          `<div class="card-icons"><p><i class="fa-regular fa-comment"></i> 0</p><p><i class="fa-solid fa-paperclip"></i> 0</p></div>`,
        userHTML:
          cardData.user ||
          `<div class="user"><img src="./images/avatar.svg" alt="avatar" draggable="false"></div>`,
      });
      column.appendChild(card);
    });
  });
}

window.addEventListener("load", loadBoard);
