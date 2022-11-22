// Se selecciona elementos HTML necesarios
const form = document.getElementById('form');
const resultHtml = document.getElementById('result-html');
const spinner = document.getElementById('spinner');
const chartMessage = document.getElementById('chart-message');
const ctx = document.getElementById('chart');

// Se definen variables genéricas
let chart = '';

// Escucha el evento submit del formulario
form.addEventListener('submit', function(e){
    e.preventDefault();
    preloader(true);
    const data = new FormData(e.target);
    let clp = 0;
    let currency = '';
    for (let [key, value] of data.entries()) { 
        key == 'clp' && (clp = value);
        key == 'currency' && (currency = value);
    }

    getCurrency(currency).then(res => {
        let response = '';
        preloader(false);
        if(typeof res != "string"){
            let valueCurrency = res.serie[0].valor;
            let cod = res.codigo;
            serie = res.serie.slice(0,10);
            chart != '' && chart.destroy();
            getChart(serie, cod);
            response = `<h2>${convert(valueCurrency, clp)} <span class="text-uppercase h5 fw-normal">${cod}</span></h2>`;
        }else{
            response = notice(res);
        }
        resultHtml.innerHTML = response;
    });
    
});

// Consulta a la API https://mindicador.cl/api
async function getCurrency(currency){
    try{
        const getData = await fetch(`https://mindicador.cl/api/${currency}`);
        const json = await getData.json();
        return json;
    }catch(err){
        return `¡Ups! Algo ha salido mal, por favor inténtalo nuevamente.`;
    }
}

// Realiza el cálculo para la conversión
function convert(valueCurrency, clp){
    const clpValue = parseInt(clp.toString().replaceAll('.', ''));
    return Number((clpValue / valueCurrency).toFixed(2)).toLocaleString('es-cl',{ minimumFractionDigits: 4 });
}

// Muestra u oculta preloader
function preloader(show){
    show ? spinner.classList.remove('d-none') : spinner.classList.add('d-none');
}

// Retorna un elemento alert
function notice(message){
    return `<div class="h6 fw-light text-danger d-flex align-items-center mb-0">
        <span class="material-symbols-outlined me-2">error</span><br>
        <span>${message}</span>
    </div>`;
}

// Muestra gráfico
function getChart(serie, cod){
    ctx.classList.remove('d-none');
    chartMessage.classList.add('d-none');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets:[{
                label: cod.toUpperCase(),
                data: serie,
                borderColor: '#0d6efd',
                backgroundColor: '#0d6efd',
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