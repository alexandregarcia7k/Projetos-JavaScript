function verificar() {

    let data = new Date()
    let ano = data.getFullYear()
    let fano = document.getElementById('txtano')
    let res = document.querySelector('div#res') //só para diferenciar e usar o query
    const anomin = 1900

    if (fano.value.length == 0 || 
        Number(fano.value) > ano || 
        Number(fano.value) < anomin) {
        window.alert(`Por favor, insira um ano entre ${anomin} e ${ano}.`)   
    } else {
        let fsex = document.getElementsByName('radsex')
        let idade = ano - Number(fano.value)
        let gen = ''
        let img = document.createElement('img')
        img.setAttribute('id', 'foto')
        img.setAttribute('class', 'img')
            if (fsex[0].checked) {
                gen = 'Homem'
                if (idade >= 0 && idade < 10) {
                    //criança
                    img.setAttribute('src', '../Verificador Idade/Images/bebeM.jpg')
                } else if (idade < 21) {
                    img.setAttribute('src', '../Verificador Idade/Images/jovemM.jpg')
                    //jovem
                }else if (idade < 50){
                    img.setAttribute('src', '../Verificador Idade/Images/adultoM.jpg')
                    //adulto
                }else{
                    img.setAttribute('src', '../Verificador Idade/Images/idosoM.jpg')
                    //idoso
                }
                
                    } else if (fsex[1].checked) {
                        gen = 'Mulher'
                        if (idade >= 0 && idade < 10) {
                            //criança
                            img.setAttribute('src', '../Verificador Idade/Images/bebeF.jpg')
                        } else if (idade < 21) {
                            img.setAttribute('src', '../Verificador Idade/Images/jovemF.jpg')
                            //jovem
                        }else if (idade < 50){
                            img.setAttribute('src', '../Verificador Idade/Images/adultoF.jpg')
                            //adulto
                        }else{
                            img.setAttribute('src', '../Verificador Idade/Images/idosoF.jpg')
                            //idoso
                        }
        }
        res.style.textAlign = 'center'
        res.innerHTML = `Detectamos ${gen} com ${idade} anos.`
        res.appendChild(img)
    }
}
window.onload = function() {
    console.log('Hello World!')
    document.getElementById('txtano').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        verificar(); // permite que o usuário aperte Enter para verificar
    }
});
    document.getElementById('txtano').addEventListener('paste', e => {
    const textoColado = (e.clipboardData || window.clipboardData).getData('text');
    if (!/^[0-9]+$/.test(textoColado)) {
        e.preventDefault();
    }
});
}
window.document.querySelector('input[type="button"]').addEventListener('click', verificar);



//res.innerHTML = `Idade calculada: ${idade}`