let dolar = 0;
let cotacaoUSD = 0;
let timeoutId;

async function pegarCotacao() {
    try {
        const resposta = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,BRL-USD');
        const dados = await resposta.json();
        cotacaoUSD = parseFloat(dados.USDBRL.bid);
        console.log("Cotação atual do USD:", cotacaoUSD, "teste");
        return cotacaoUSD; 
    } catch (erro) {
        console.error("Erro ao buscar a cotação: ", erro);
        alert("Não foi possível carregar a cotação. Atualmente está usando último valor atualizado do dolar.")
        return 5.0
    }
}

let usdInput = document.querySelector("#usd");
let brlInput = document.querySelector("#brl");

(async () => {
    dolar = await pegarCotacao(); 
    console.log("Cotação atual do USD:", dolar);

    usdInput.value = formatCurrency("1,00");
    convert("usd-to-brl");
})();

function validateNumberInput(value) {
    return value.replace(/[^0-9.,]/g, "");
}

function validateKeyPress(event) {
    const char = String.fromCharCode(event.which);
    if (!/[\d., ]/.test(char) && event.which > 31) {
        event.preventDefault();
        return false;
    }
    return true;
}

function handleEmptyValue(input, conversionType) {
    const fixedValue = fixValue(input.value);
    if (fixedValue === 0 || input.value.trim() === "") {
        input.value = formatCurrency("1,00");
        convert(conversionType);
    }
}

function debounce(func, delay = 500) {
    return function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, arguments), delay);
    };
}


usdInput.addEventListener("keypress", validateKeyPress);
usdInput.addEventListener("input", debounce(() => {
    usdInput.value = formatCurrency(usdInput.value);
    convert("usd-to-brl");
}));

brlInput.addEventListener("keypress", validateKeyPress);
brlInput.addEventListener("input", debounce(() => {
    brlInput.value = formatCurrency(brlInput.value);
    convert("brl-to-usd");
}));
usdInput.addEventListener("blur", () => handleEmptyValue(usdInput, "usd-to-brl"));
brlInput.addEventListener("blur", () => handleEmptyValue(brlInput, "brl-to-usd"));

function formatCurrency(value) {
    let fixedValue = fixValue(value);
    let options = { useGrouping: false, minimumFractionDigits: 2 };
    let formatter = new Intl.NumberFormat("pt-BR", options);
    return formatter.format(fixedValue);
}

function fixValue(value) {
    let fixedValue = value.replace(",", ".");
    let floatValue = parseFloat(fixedValue);
    if (isNaN(floatValue)) floatValue = 0;
    return floatValue;
}

function convert(type) {
    if (type == "usd-to-brl") {
        let fixedValue = fixValue(usdInput.value);
        let result = fixedValue * dolar;
        brlInput.value = formatCurrency(result.toFixed(2));
    }
    if (type == "brl-to-usd") {
        let fixedValue = fixValue(brlInput.value);
        let result = fixedValue / dolar;
        usdInput.value = formatCurrency(result.toFixed(2));
    }
}
