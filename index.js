let botaoAdicionar = document.getElementById('adicionar');
let audio = document.getElementById('youtube');
let botaoPerfil = document.getElementById('perfil');
let listaDeMusicas = document.getElementById('lista-de-musicas');
let npPessoa = document.getElementById('np-pessoa');
let npMusica = document.getElementById('np-musica');
let trocarFoto = document.getElementById('trocar-foto');
let inputAvatar = document.getElementById('input-avatar');

let modalLogin = document.getElementById('modal-login');
let modalOverlay = document.getElementById('modal-overlay');
let fecharLogin = document.getElementById('fechar-login');
let dropdown = document.getElementById('dropdown');
let dropdownOverlay = document.getElementById('dropdown-overlay');
let modalAdicionar = document.getElementById('modal-adicionar');
let adicionarOverlay = document.getElementById('adicionar-overlay');
let fecharAdicionar = document.getElementById('fechar-adicionar');
let modalCadastro = document.getElementById('modal-cadastro');
let cadastroOverlay = document.getElementById('cadastro-overlay');
let fecharCadastro = document.getElementById('fechar-cadastro');
let abrirCadastro = document.getElementById('abrir-cadastro');

const servidor = 'https://api.flamita.club';

let arrayMusicas = [];
let listaAleatoria = [];
let itensCarregando = [];
let musicaAtual = 0;

let estado = {
    logade: false,
    pessoa: ''
}

document.addEventListener('DOMContentLoaded', e => {
    // fecha dropdown que começa aberto
    toggleModal(dropdown, dropdownOverlay);
    // fecha modal de cadastro, que começa aberto
    toggleModal(modalCadastro, cadastroOverlay);
    // fecha modal adicionar música, que começa aberto
    toggleModal(modalAdicionar, adicionarOverlay);
    // fecha modal de login, que começa aberto
    toggleModal(modalLogin, modalOverlay);
    // verifica se pessoa já está logada
    dadosMeus().then(r => {
        if(r.logade === true) {
        estado.logade = true;
        estado.pessoa = r.dados.nome;
        encontrarAvatar(r.dados.nome)
            .then(avatar => {
                botaoPerfil.src = `${servidor}/avatar/${avatar}`;
            });    
        } else {
            //toggleModal(modalLogin, modalOverlay);
        }
        carregarMusicas().then((am) => {
            musicaAtual = 0;
            geraAleatorio(0, am.length - 1); // gera lista aleatória
            popularLista(); // popula lista de músicas da interface
            stream(am[listaAleatoria[0]]); // carrega a primeira música da lista aleatória
        });
    })
});

// passar para próxima música quando acabar a atual
audio.addEventListener('ended', e => {
    musicaAtual++;
    let n = listaAleatoria[musicaAtual];
    if (n < arrayMusicas.length) {
        stream(arrayMusicas[listaAleatoria[musicaAtual]]);
        audio.play();
        marcarMusicaAtual();
    }
});

audio.addEventListener('play', e => {
    marcarMusicaAtual();
});

// abrir modal para adicionar nova música ao banco de dados
botaoAdicionar.addEventListener('click', e => {
    if (estado.logade) {
        toggleModal(modalAdicionar, adicionarOverlay);
    } else {
        toggleModal(modalLogin, modalOverlay);
    }
});

// abrir modal para fazer cadastro
abrirCadastro.addEventListener('click', e => {
    toggleModal(modalLogin, modalOverlay);
    toggleModal(modalCadastro, cadastroOverlay);
});

// trocar avatar
trocarFoto.addEventListener('click', e => {
    if (inputAvatar) {
        inputAvatar.click();
    }
});
inputAvatar.addEventListener('change', enviarArquivo, false);
function enviarArquivo() {
    let arquivo = this.files[0];
    let dados = new FormData();
    dados.append('arquivo', arquivo);

    fetch(`${servidor}/trocar-avatar`, {
        method: 'POST',
 /*        headers: {
            'Content-Type': 'application/json'
        }, */
        withCredentials: true,
        credentials: 'include',
        body: dados
    })
        .then(res => {
            toggleModal(dropdown, dropdownOverlay);
            carregarAvatar();
        })
}

// logout
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
            toggleModal(dropdown, dropdownOverlay);
            toggleModal(modalLogin, modalOverlay);
            botaoPerfil.src = "./avatar.png";
            estado.logade = false;
            estado.pessoa = ''
            carregarMusicas().then((am) => {
                popularLista(); // popula lista de músicas da interface
                stream(am[listaAleatoria[0]]); // carrega a primeira música da lista aleatória
                musicaAtual = 0;
                marcarMusicaAtual();
            });
        });
})

// ---
// MODAIS E MENUS

// Menu dropdown perfil

botaoPerfil.addEventListener('click', e => {
    if (estado.logade) {
        toggleModal(dropdown, dropdownOverlay);
    } else {
        toggleModal(modalLogin, modalOverlay);
    }
});

dropdownOverlay.addEventListener('click', e => {
    toggleModal(dropdown, dropdownOverlay);
})

// Modal Login

fecharLogin.addEventListener('click', e => {
    toggleModal(modalLogin, modalOverlay);
    formLogin.reset();
});
modalOverlay.addEventListener('click', e => {
    toggleModal(modalLogin, modalOverlay);
    formLogin.reset();
});

// Modal Cadastro

fecharCadastro.addEventListener('click', e => {
    toggleModal(modalCadastro, cadastroOverlay);
    formCadastro.reset();
});
cadastroOverlay.addEventListener('click', e => {
    toggleModal(modalCadastro, cadastroOverlay);
    formCadastro.reset();
});

// Modal adicionar música

fecharAdicionar.addEventListener('click', e=> {
    toggleModal(modalAdicionar, adicionarOverlay);
    formAdicionar.reset();
});

adicionarOverlay.addEventListener('click', e=> {
    toggleModal(modalAdicionar, adicionarOverlay);
    formAdicionar.reset();
});


// login
const formLogin = document.getElementById('form-login');
formLogin.addEventListener('submit', e => {
    const dados = {
        nome: formLogin.elements['nome'].value,
        senha: formLogin.elements['senha'].value
    }

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
            if (r.autenticada) {
                estado.pessoa = dados.nome;
                toggleModal(modalLogin, modalOverlay);
                carregarAvatar();
                carregarMusicas().then((am) => {
                    popularLista(); // popula lista de músicas da interface
                });
            } else {
                console.log('não está autenticade!!!');
                alert('Login falhou. Parece que você precisa se cadastrar primeiro.')
                toggleModal(modalLogin, modalOverlay);
                formLogin.reset();
                toggleModal(modalCadastro, cadastroOverlay);
            }
    });

    formLogin.reset();
    e.preventDefault();
});

// cadastro
const formCadastro = document.getElementById('form-cadastro');
formCadastro.addEventListener('submit', e => {
    if(formCadastro.elements['senha'].value === formCadastro.elements['senha2'].value) {
        const dados = {
            nome: formCadastro.elements['nome'].value,
            senha: formCadastro.elements['senha'].value
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
                if (r.autenticada) {
                    toggleModal(modalCadastro, cadastroOverlay);
                    formCadastro.reset();
                    alert('Cadastro realizado com sucesso! Bem-vinde ao flama club :)');

                    // faz login após cadastro
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
                            if (r.autenticada) {
                                estado.pessoa = dados.nome;                                
                                carregarAvatar();
                                carregarMusicas().then((am) => {
                                    popularLista(); // popula lista de músicas da interface
                                });
                            } else {
                                console.log('não está autenticade!!!');
                                alert('Login falhou. Tente novamente.')
                                toggleModal(modalLogin, modalOverlay);
                            }
                        });

                } else {
                console.log("erro de autenticação ao cadastrar nova pessoa");
                }
        });
    } else {
        alert('as senhas digitadas são diferentes');
    }
    formCadastro.reset();
    e.preventDefault();
});


// adicionar música
const formAdicionar = document.getElementById('form-adicionar');
formAdicionar.addEventListener('submit', e => {

    let novoLink = {
        link: formAdicionar.elements['link'].value,
        titulo: formAdicionar.elements['titulo'].value,
        artista: formAdicionar.elements['artista'].value
    }
    
    itensCarregando.push(animacaoCarregando());

    fetch(`${servidor}/musicas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true,
        credentials: 'include',
        body: JSON.stringify(novoLink)
    }).then(r => r.json()
    ).then(res => {
        console.log('sucesso ao adicionar música?', res.baixado);
        if (res.baixado) {
            console.log('executando if res.baixado');
            carregarMusicas().then((am) => {
                console.log('obteve resposta de carregarMusicas -> am:', am);
                console.log('arrayMusicas:', arrayMusicas);
                itensCarregando.pop(); // remove item da lista de carregamento
                console.log('itens carregando (após pop):', itensCarregando);
                listaAleatoria.push(am.length - 1); // insere número da nova música
                console.log('listaAleatoria (após inserção):', listaAleatoria);
                popularLista(); // popula lista de músicas da interface
                marcarMusicaAtual();
            });
        } else {
            itensCarregando.pop();
            popularLista();
            marcarMusicaAtual();
            if (res.repetida) {
                alert('música já existe na lista, por favor insira outra');
            } else {
                alert('música não pôde ser adicionada, por favor tente novamente em alguns minutos');
            }
        }
    });

    toggleModal(modalAdicionar, adicionarOverlay);
    alert('sua música está sendo adicionada e em breve entrará na lista');

    formAdicionar.reset();
    e.preventDefault();
});


// ---
// FUNÇÕES

// retorna objeto com dados da pessoa logada
async function dadosMeus () {
    const dados = await fetch(`${servidor}/eu`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true,
        credentials: 'include'
    })
        .then(res => res.json())
        .then(d => {
            return d
        });
    return dados;
}

// encontra avatar
async function encontrarAvatar (pessoa) {
    const avatar = await fetch(`${servidor}/${pessoa}?` + new URLSearchParams({
        avatar: true
    }))
        .then(res => res.json())
        .then(dados => {
            return dados.avatar;
        });
    return avatar;
}

// carrega avatar no elemento de perfil da navBar
async function carregarAvatar() {
    dadosMeus()
    .then(dados => {
        encontrarAvatar(dados.dados.nome)
        .then(avatar => {
            botaoPerfil.src = `${servidor}/avatar/${avatar}`;
        });
        estado.logade = true;
        estado.pessoa = dados.dados.nome;
    });
}


// atualiza array de musicas
async function carregarMusicas () {
    let am = await fetch(`${servidor}/musicas`, {})
    .then(res => res.json())
    .then(musicas => {
        console.log('carregarMúsicas fetch retorno:', musicas);
        arrayMusicas = [];
        musicas.forEach(element => {
            arrayMusicas.push({
                'mid': element.mid,
                'link': element.link,
                'arquivo': element.arquivo,
                'titulo': element.titulo,
                'artista': element.artista,
                'pessoa': element.pessoa,
                'criacao': element.criacao
            });
        })
        return arrayMusicas;
    });
    return am;
}

// limpa e popula elemento html para exibir lista de músicas
function popularLista() {
    while(listaDeMusicas.lastChild) {
        listaDeMusicas.lastChild.remove();
    }
    let escuro = true; // para alternar cor de fundo dos items
    listaAleatoria.forEach(a => {
        let m = arrayMusicas[a];

        let item = document.createElement('div');
        let nome = document.createElement('span');
        let avatar = document.createElement('img');

        avatar.classList.add('avatar');
        nome.classList.add('span-musica-na-lista')
        item.classList.add('nome-na-lista');
        item.classList.add('item');
        if (escuro) {
            item.classList.add('item-escuro');
            escuro = false;
        } else {
            escuro = true;
        }
        item.style.padding = "0.25em";

        encontrarAvatar(m.pessoa).then(a => {
            avatar.src = `${servidor}/avatar/${a}`;
        });

        nome.innerText = `${m.titulo} - ${m.artista}`;
        item.mid = m.mid;

        item.appendChild(avatar);
        item.appendChild(nome);

        if (m.pessoa === estado.pessoa) {
            let lixeira = document.createElement('button');
            lixeira.innerText = '🆇';
            lixeira.mid = m.mid;
            lixeira.classList.add('lixeira');
            item.appendChild(lixeira);
        } else {
            let espaco = document.createElement('div');
            item.appendChild(espaco);
        }

        listaDeMusicas.appendChild(item);
    });

    itensCarregando.forEach(i => {
        listaDeMusicas.appendChild(i);
    })

    ativarLixeiras();
    ativarNavegacaoMusical();
}

// adiciona eventListeners aos botoes de apagar música
async function ativarLixeiras () {
    let lixao = document.getElementsByClassName('lixeira');
    Array.from(lixao).forEach(lixeira => {
        lixeira.addEventListener('click', e => {
            fetch(`${servidor}/musicas/${lixeira.mid}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true,
                credentials: 'include'
            }).then(r => {

                // reorganiza listaAleatoria
                let posicaoMusica = arrayMusicas.findIndex(e => {
                    return e.mid === lixeira.mid;
                });
                reduzirAleatoria = listaAleatoria.filter(n => {
                    return n > posicaoMusica;
                });
                reduzirAleatoria.forEach(n => {
                    let i = listaAleatoria.indexOf(n);
                    listaAleatoria[i]--;
                });
                posicaoAleatoria = listaAleatoria.findIndex(n => {
                    return n === posicaoMusica;
                });
                listaAleatoria.splice(posicaoAleatoria, 1);
    
                // remove botão de excluir
                lixeira.remove();

                // recarrega músicas e repopula lista na tela
                carregarMusicas().then((am) => {
                    popularLista(); // popula lista de músicas da interface
                    if (musicaAtual === posicaoAleatoria) {
                        if (musicaAtual < listaAleatoria.length) {
                            if (taTocando(audio)) {
                                stream(am[listaAleatoria[musicaAtual]]);
                                audio.play();
                            } else {
                                stream(am[listaAleatoria[musicaAtual]]);
                                audio.pause();
                            }
                            marcarMusicaAtual();
                        } else {
                            musicaAtual--;
                            stream(null);
                            audio.pause();
                        }
                    } else {
                        marcarMusicaAtual();
                    }
                });
            });
        });
    });
}

// adiciona eventListeners às músicas da playlist, para navegação
function ativarNavegacaoMusical() {
    let musicas = document.getElementsByClassName('nome-na-lista');
    Array.from(musicas).forEach(musica => {
        musica.addEventListener('click', e => {
            let filhos = e.currentTarget.children;
            let span = filhos[1];
            if((e.target === e.currentTarget)||(e.target === span)) {
                let posicaoMusica = arrayMusicas.findIndex(e => {
                    return e.mid === musica.mid;
                });
                let posicaoAleatoria = listaAleatoria.findIndex(e => {
                    return e === posicaoMusica;
                })
                stream(arrayMusicas[listaAleatoria[posicaoAleatoria]]);
                musicaAtual = posicaoAleatoria;
                audio.play();
                marcarMusicaAtual();
            }
        });
    });
}

// destaca música atual na playlist
function marcarMusicaAtual() {
    let musicaAtualDeFato = arrayMusicas[listaAleatoria[musicaAtual]];
    let musicas = document.getElementsByClassName('nome-na-lista');
    Array.from(musicas).forEach(m => {
        if (m.mid === musicaAtualDeFato.mid) {
            m.classList.add('musica-atual');
        } else {
            m.classList.remove('musica-atual');
        }
    })
}

// adiciona animação de carregamento de música
function animacaoCarregando() {
    let divCarregando = document.createElement('div');
    let imgCarregando = document.createElement('img');
    divCarregando.classList.add('item-carregando');
    divCarregando.style.padding = "0.25em";
    imgCarregando.src = './carregando.gif';
    divCarregando.appendChild(imgCarregando);
    listaDeMusicas.appendChild(divCarregando);
    return divCarregando;
}

// preenche listaAleatoria com um array de números inteiros aleatórios entre min e max (inclusive), sem repetições
function geraAleatorio(min, max) {
    let num;
    for (i = min; i <= max; i++) {
        num = Math.floor(Math.random() * (max - min + 1) + min);
        while(listaAleatoria.includes(num)) {
            num = Math.floor(Math.random() * (max - min + 1) + min);
        }
        listaAleatoria.push(num);
    }
}

// carrega música no elemento de audio
async function stream (musica) {
    if (musica) {
        audio.src = `${servidor}/${musica.arquivo}`;
        musicaInfo(musica.mid).then(m => {
            encontrarAvatar(m.pessoa).then(a => {
                npPessoa.src = `${servidor}/avatar/${a}`;
                npMusica.innerText = `${m.titulo} - ${m.artista}`;
            });
        });
    } else {
        audio.src = '';
        npPessoa.src = './avatar.png';
        npMusica.innerText = 'nenhuma música tocando';
        console.log('não foi possível carregar música no player');
    }
}

// retorna objeto com informações da música
async function musicaInfo (id) {
    const m = await fetch(`${servidor}/musica/${id}`)
    .then(res => res.json())
    .then(musica => {
        return musica;
        })
    return m;
}

// indica se o player está tocando
function taTocando(player) {
    return !player.paused && !player.ended && 0 < player.currentTime;
}

// abre e fecha modal com overlay
function toggleModal(modal, overlay) {
    modal.classList.toggle('closed');
    overlay.classList.toggle('closed');
}
