const form = document.getElementById('form');
const resultHtml = document.getElementById('result-html');
const spinner = document.getElementById('spinner');
const chartMessage = document.getElementById('chart-message');
let cod = '';
let clp = 0;
let currency = '';
let valueCurrency = 0;
let serie = [];
let chart = '';

form.addEventListener('submit', function(e){

    e.preventDefault();
    preloader(true);
    const data = new FormData(e.target);
    for (let [key, value] of data.entries()) { 
        key == 'clp' && (clp = value);
        key == 'currency' && (currency = value);
    }

    getCurrency(currency).then(res => {
        response = '';
        preloader(false);
        if(typeof res === 'number'){
            valueCurrency = res;
            response = `<h2>${convert(valueCurrency)} <span class="text-uppercase">${cod}</span></h2>`;
            chart != '' && chart.destroy();
            getChart();
        }else{
            response = res;
        }        
        resultHtml.innerHTML = response;
    });
    
});

async function getCurrency(currency){
    try{
        const getData = await fetch(`https://mindicador.cl/api/${currency}`);
        const json = await getData.json();
        cod = json.codigo;
        serie = json.serie.slice(0,10);
        return json.serie[0].valor;
    }catch(err){
        return notice('¡Ups! Algo ha salido mal, por favor inténtalo nuevamente.');
    }
}

function convert(valueCurrency){
    return (clp / valueCurrency).toFixed(1);
}

function preloader(show){
    show ? spinner.classList.remove('d-none') : spinner.classList.add('d-none');
}

function notice(message){
    return `<div class="h6 fw-light text-danger d-flex align-items-center mb-0">
        <span class="material-symbols-outlined me-2">error</span><br>
        <span>${message}</span>
    </div>`;
}

function getChart(){
    const ctx = document.getElementById('chart');
    chartMessage.classList.add('d-none');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets:[{
                label: cod.charAt(0).toUpperCase() + cod.slice(1),
                data: serie
            }]
        },
        options: {
            scales: {
                x: {
                    ticks: {
                        callback: function(v, i, ticks) {
                            let date = new Date(serie[i].fecha);
                            return  `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                        }
                    }
                }
            },
            parsing: {
              xAxisKey: 'fecha',
              yAxisKey: 'valor'
            }
          }
    });
}