let selectedPriority = '';
let selectedAvatar = '';
let currentColumnTarget = null;
let cardToDelete = null;



document.addEventListener('dragstart', e => {
    if (e.target.classList.contains('kanban-card')) {
        e.target.classList.add('dragging');
    }
});

document.addEventListener('dragend', e => {
    if (e.target.classList.contains('kanban-card')) {
        e.target.classList.remove('dragging');
    }
});

document.querySelectorAll('.kanban-cards').forEach(column => {
    column.addEventListener('dragover', e => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(column, e.clientY);
        if (afterElement == null) {
            column.appendChild(dragging);
        } else {
            column.insertBefore(dragging, afterElement);
        }
        e.currentTarget.classList.add('cards-hover');
    })

    column.addEventListener('dragleave', e => {
        e.currentTarget.classList.remove('cards-hover');
    })

    column.addEventListener('drop', e => {
        e.currentTarget.classList.remove('cards-hover');
        saveBoard();
        
    })
})

document.addEventListener('click', e => {
    const menuBtn = e.target.closest('.btn-ellip button');

    if (menuBtn) {
        const menu = menuBtn.nextElementSibling;

        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        return;
    }

    document.querySelectorAll(".btn-edit").forEach(menu => menu.style.display = "none");
});


function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
}
function saveBoard() {
    const board = [];
    document.querySelectorAll('.kanban-column').forEach(column => {
        const cards = [];
        column.querySelectorAll('.kanban-card').forEach(card => {
            cards.push({
                badge: card.querySelector('.badge').outerHTML,
                title: card.querySelector('.card-title').innerText,
                icons: card.querySelector('.card-icons').outerHTML,
                user: card.querySelector('.user').outerHTML
            });
        });
        board.push(cards);
    });
    localStorage.setItem('kanbanBoard', JSON.stringify(board));
}
function loadBoard() {
    const board = JSON.parse(localStorage.getItem('kanbanBoard'));
    if(!board) return; 
    document.querySelectorAll('.kanban-cards').forEach((column, index) => {
        column.innerHTML = '';
        board[index].forEach(cardData => {
            const card = document.createElement('div');
            card.classList.add('kanban-card')
            card.setAttribute('draggable', 'true');
            card.innerHTML =  `
             <div class="badge-row"> 
                ${cardData.badge}
                <div class="btn-ellip">
                    <button>
                        <i class="fa-solid fa-ellipsis"></i>
                    </button>
                    <div class="btn-edit" style="display:none;">
                        <button>
                            <i class="fa-solid fa-pencil"></i>
                            
                        </button>
                        <button>
                            <i class="fa-solid fa-trash-can"></i>
                            
                        </button>
                    </div>
                </div>
                </div>
                <p class="card-title">${cardData.title}</p>
                <div class="card-infos">
                    ${cardData.icons}
                    ${cardData.user}
                </div>
                
            `;
            column.appendChild(card);
            reapplyDragEvents();
        })
    })
}
function reapplyDragEvents() {
    document.querySelectorAll('.kanban-card').forEach(card => {
        card.addEventListener('dragstart', e => {
            e.target.classList.add('dragging');
        });
        card.addEventListener('dragend', e => {
            e.currentTarget.classList.remove('dragging');
        });
    });
}
function openNewCardForm() {
    const priority = prompt('Informe a prioridade (alta, media, baixa):', 'alta',);
    if(!priority) return;

    const title = prompt('Digite o título da sua tarefa:', 'Nova tarefa');
    if(!title) return;

    const comments = prompt('Quantidade de comentarios', '0');
    const attachments = prompt('Quantidade de anexos', '0');

    const avatar = prompt('URL da imagem de avatar:', './images/avatar.svg');

    const badgeClass = priority.toLowerCase() === 'alta' ? 'high':
                       priority.toLowerCase() === 'media' ? 'medium':
                       priority.toLowerCase() === 'baixa' ? 'low':'';
    
    const newCard = document.createElement('div');
    newCard.classList.add('kanban-card');
    newCard.setAttribute('draggable', 'true');
    newCard.innerHTML = `
    <div class="badge-row"> 
        <div class="badge ${badgeClass}">
            <span>${priority.charAt(0).toUpperCase() + priority.slice(1)} prioridade</span>
        </div>
        <div class="btn-ellip">
                <button>
                    <i class="fa-solid fa-ellipsis"></i>
                </button>
                    <div class="btn-edit">
                        <button>
                            <i class="fa-solid fa-pencil"></i>
                            
                        </button>
                        <button>
                            <i class="fa-solid fa-trash-can"></i>
                            
                        </button>
                 </div>
            </div>
        <p class="card-title">${title}</p>
        <div class="card-infos">
            <div class="card-icons">
                <p><i class="fa-regular fa-comment"></i> ${comments}</p>
                <p><i class="fa-solid fa-paperclip"></i> ${attachments}</p>
            </div>
            <div class="user">
                <img src="${avatar}" alt="avatar">
            </div>
        </div>
        </div>
    `;
    columnElement.appendChild(newCard);
    saveBoard();
                
}


// Abrir modal ao clicar no "+"
document.addEventListener('click', e => {
  const addBtn = e.target.closest('.add-card');
  if (addBtn) {
    currentColumnTarget = addBtn.closest('.kanban-column').querySelector('.kanban-cards');
    document.getElementById('newCardModal').style.display = 'flex';
  }
});

// Fechar modal (no X ou clicando no overlay)
document.addEventListener('click', e => {
  if (e.target.closest('.close-modal') || e.target.id === 'newCardModal') {
    document.getElementById('newCardModal').style.display = 'none';
    resetModalForm();
  }
});

// Selecionar prioridade (botões coloridos)
document.addEventListener('click', e => {
  const btn = e.target.closest('.priority-btn');
  if (!btn) return;

  document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedPriority = btn.dataset.priority; // 'alta' | 'media' | 'baixa'
});

// Selecionar avatar (imagem)
document.addEventListener('click', e => {
  const img = e.target.closest('.avatar-option');
  if (!img) return;

  document.querySelectorAll('.avatar-option').forEach(i => i.classList.remove('selected'));
  img.classList.add('selected');

  // Use o caminho do atributo (relativo) para evitar inconsistência entre ambientes
  selectedAvatar = img.getAttribute('src');
});

// Submit do formulário do modal (delegado)
document.addEventListener('submit', e => {
  if (e.target.id !== 'newCardForm') return;
  e.preventDefault();

  if (!selectedPriority) {
    alert('Selecione uma prioridade!');
    return;
  }
  if (!selectedAvatar) {
    alert('Selecione um avatar!');
    return;
  }

  const title = document.getElementById('taskTitle').value.trim();
  const comments = document.getElementById('taskComments').value || '0';
  const attachments = document.getElementById('taskAttachments').value || '0';

  const badgeClass = selectedPriority === 'alta' ? 'high'
                    : selectedPriority === 'media' ? 'medium'
                    : 'low';

  const newCard = document.createElement('div');
  newCard.classList.add('kanban-card');
  newCard.setAttribute('draggable', 'true');
  newCard.innerHTML = `
    <div class="badge ${badgeClass}">
      <span>${selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)} prioridade</span>
    </div>
    <p class="card-title">${title}</p>
    <div class="card-infos">
      <div class="card-icons">
        <p><i class="fa-regular fa-comment"></i> ${comments}</p>
        <p><i class="fa-solid fa-paperclip"></i> ${attachments}</p>
      </div>
      <div class="user">
        <img src="${selectedAvatar}" alt="avatar" draggable="false">
      </div>
    </div>
  `;

  currentColumnTarget.appendChild(newCard);
  saveBoard();
  loadBoard();
  

  document.getElementById('newCardModal').style.display = 'none';
  resetModalForm();
});

// Reset do modal
function resetModalForm() {
  const form = document.getElementById('newCardForm');
  if (form) form.reset();
  document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.avatar-option').forEach(i => i.classList.remove('selected'));
  selectedPriority = '';
  selectedAvatar = '';
}
document.addEventListener('click', e => {
    const deleteBtn = e.target.closest('.btn-edit .fa-trash-can');
    if(!deleteBtn) return;
    
    cardToDelete = deleteBtn.closest('.kanban-card');
    if(!cardToDelete) return;   
    document.getElementById('deleteConfirmModal').style.display='flex';
    
});
document.querySelector('.close-delete-modal').addEventListener('click', () => {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    cardToDelete = null;
})
document.getElementById('cancelDelete').addEventListener('click', () => {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    cardToDelete = null;
})
document.getElementById('confirmDelete').addEventListener('click', () => {
    if(cardToDelete) {
        cardToDelete.remove();
        saveBoard();
    }
    document.getElementById('deleteConfirmModal').style.display = 'none';
    cardToDelete = null;
})

window.addEventListener('load', loadBoard,);