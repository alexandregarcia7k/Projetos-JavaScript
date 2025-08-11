function contar(){
    let ini = document.getElementById('txti') //variaveis para os ID
    let fim = document.getElementById('txtf')
    let passo = document.getElementById('txtp')
    let res = document.getElementById('res')

    if (ini.value.length == 0 || fim.value.length == 0 || passo.value.length == 0){  //validador, caso não tenha nenhum valor.
        res.innerHTML = '<erro> Faltam dados!'

    } else {
        res.innerHTML = 'Contando: '
        let i = Number(ini.value)
        let f = Number(fim.value)  // convertendo value para number
        let p = Number(passo.value)
        if (p <= 0) {
            res.innerHTML ='Passo inválido! Considerando PASSO 1: '
            p = 1
        }
        if (i < f) { //for <para> (inicio ; teste ; incremento)
            for(let contador = i; contador <= f; contador += p){ //contador recebe inicio, enquanto <= fim, contador == contador + 1
                res.innerHTML += ` ${contador} \u{1F449} `
            } //contagem crescente
            
        } else {
            for(let contador = i; contador >= f; contador -= p){
                res.innerHTML += `${contador} \u{1F449}`
            }//contagem decrescente
        }
        res.innerHTML += `\u{1F3C1}`
        ini.value = ''
        fim.value = ''
        passo.value = ''
        ini.focus()
    }
    
}
window.onload = function() {
    console.log('Hello World!')
    document.getElementById('txti').focus //foco automatico
    //adiciona evento enter nos 3 campos
    const campos = ['txti', 'txtf', 'txtp']
    campos.forEach(id => {
        document.getElementById(id).addEventListener('keydown', function(event){
            if(event.key === 'Enter'){
                contar()
            }
        })
    })
}
    