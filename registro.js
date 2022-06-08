const form = document.getElementById('form');

const servidor = 'http://localhost:5000';

form.addEventListener('submit', e => {
    
    console.log('usuárie apertou enviar');
    console.log(form.elements['senha']);
    console.log(form.elements['senha2']);

    if(form.elements['senha'].value === form.elements['senha2'].value) {
        const dados = {
            nome: form.elements['nome'].value,
            senha: form.elements['senha'].value
        }
        fetch(`${servidor}/registro`, {
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
                    window.location.replace('./login.html');
                } else {
                    form.reset();
                    avisoDeErro.style.visibility = 'visible';
                }
        });
    } else {
        alert('as senhas digitadas são diferentes');
    }

   
    

    e.preventDefault();
});