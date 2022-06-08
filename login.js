const form = document.getElementById('form');
const avisoDeErro = document.getElementById('erro');

const servidor = 'http://localhost:5000';

form.addEventListener('submit', e => {
    const dados = {
        nome: form.elements['nome'].value,
        senha: form.elements['senha'].value
    }
    console.log('usuárie apertou enviar');

    fetch(`${servidor}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true,
        credentials: 'include',
        body: JSON.stringify(dados)
    })
        .then(res => res.json())
        .then(r => {
            console.log('r.mensagem:', r.mensagem);
            if (r.autenticada) {
                let protegida = document.getElementById('protegida');
                console.log('prestes a entrar na rota protegida');
                fetch(`${servidor}/rota-protegida`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                    credentials: 'include'
                })
                    .then(res => {
                        console.log('res:', res);
                        return res.json();
                    })
                    .then(r2 => {
                        console.log('r2:', r2);
                        protegida.innerText = r2.msg;
                        window.location.assign('./index.html');
                    });
            } else {
                form.reset();
                avisoDeErro.style.visibility = 'visible';
            }
    });
    

    e.preventDefault();
});

const botaoRP = document.getElementById('rota-protegida');
botaoRP.addEventListener('click', e => {
    fetch(`${servidor}/rota-protegida`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true,
        credentials: 'include'
    })
        .then(res => {
            console.log('res:', res);
            return res.json();
        })
        .then(r2 => {
            console.log('r2:', r2);
            botaoRP.innerText = r2.msg;
        });
});

const botaoLogout = document.getElementById('logout');
botaoLogout.addEventListener('click', e => {
    fetch(`${servidor}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true,
        credentials: 'include'
    })
        .then(res => {
            protegida.innerText = 'você não está logade';
        });
})
