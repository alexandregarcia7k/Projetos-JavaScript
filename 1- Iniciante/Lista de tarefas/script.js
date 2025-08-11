let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];

function salvarTarefas() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

function exibirTarefas() {
    const lista = document.getElementById('lista-tarefas');
    lista.innerHTML = '';

    tarefas.forEach((tarefa, index) => {
        const option = document.createElement('option');
        option.textContent = tarefa;  // textContent é mais seguro que innerHTML
        option.value = index;
        lista.appendChild(option);
    });
}

function adicionarTarefa(event) {
    event.preventDefault(); // Impede o recarregamento da página

    const input = document.getElementById('nova-tarefa');
    const valor = input.value.trim(); // Remove espaços em branco
    // Validação: não permite tarefas vazias
    if(valor === '') {
        alert('Por favor, insira uma tarefa.');
        return;
    }
    // Adiciona a nova tarefa ao array
    tarefas.push(valor);
    // Limpa o campo de input
    input.value = '';
    // Atualiza a exibição das tarefas
    exibirTarefas(); 
    salvarTarefas(); // localstorage   
    // Foca novamente no campo de input para facilitar a digitação
    input.focus();

}

function removerTarefa() {
    const lista = document.getElementById('lista-tarefas');
    const selecionadas = Array.from(lista.selectedOptions);
    // Verifica se há itens selecionados
    if(selecionadas.length === 0) {
        alert('Por favor, selecione uma tarefa para remover.');
        return;
    }
    // Obtém os índices das tarefas selecionadas
    const indices = Array.from(lista.selectedOptions).map(opt => parseInt(opt.value));
    // Remove as tarefas do array (do maior indice para o menor)
    indices.sort((a, b) => b - a).forEach(index => {
        tarefas.splice(index, 1);
    });
    exibirTarefas();
    exibirTarefas(); // local storage
}
// limpar todas as tarefas
function limparTarefas() {
    if (confirm('Tem certeza que deseja limpar TODAS as tarefas?')) {
        tarefas = [];
        exibirTarefas();
        salvarTarefas();
    }
}
// Editar tarefas existentes
function editarTarefas() {
    const lista = document.getElementById('lista-tarefas');
    const selecionadas = Array.from(lista.selectedOptions);

    if (selecionadas.length !== 1)  {
        alert('Porfavor, selecione uma tarefa para editar!');
    }

    const index = parseInt(selecionadas[0].value);
    const novoTexto = prompt('Editar tarefa:', tarefas[index]);

    if (novoTexto !== null && novoTexto.trim() !== '') {
        tarefas[index] = novoTexto.trim();
        salvarTarefas();
        exibirTarefas();
    }
}
// Adiciona os event listeners quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Listener para o formulário
    document.getElementById('form-tarefa').addEventListener('submit', adicionarTarefa);
    // Listener para o botão de remover
    document.getElementById('remover').addEventListener('click', removerTarefa);
    //adicionando botao de limpar tudo  
    document.getElementById('limpar-tudo').addEventListener('click', limparTarefas);
    // Listener para tecla Enter no campo de input
    document.getElementById('nova-tarefa').addEventListener('keypress', function(e){
        if (e.key === 'Enter') {
            adicionarTarefa(e);
        }
    });
    exibirTarefas();
});