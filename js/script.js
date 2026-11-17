
// ========================================
// BANCO DE DADOS LOCAL
// ========================================

let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let temas = JSON.parse(localStorage.getItem("temas")) || [];
let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

function salvarDados() {
    localStorage.setItem("clientes", JSON.stringify(clientes));
    localStorage.setItem("temas", JSON.stringify(temas));
    localStorage.setItem("reservas", JSON.stringify(reservas));
}

function gerarId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function dinheiro(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    if (!data) return "Não informada";

    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ========================================
// NAVEGAÇÃO
// ========================================

function abrirPagina(nome) {
    document.querySelectorAll(".pagina").forEach(pagina => {
        pagina.classList.remove("ativa");
    });

    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("ativo");
    });

    const pagina = document.getElementById(nome);

    if (!pagina) return;

    pagina.classList.add("ativa");

    const menu = document.querySelector(
        `[data-pagina="${nome}"]`
    );

    if (menu) menu.classList.add("ativo");

    const titulos = {
        dashboard: "Dashboard",
        clientes: "Clientes",
        agenda: "Agenda",
        temas: "Temas",
        reservas: "Locações",
        financeiro: "Financeiro",
        relatorios: "Relatórios"
    };

    document.getElementById("tituloPagina").textContent =
        titulos[nome] || nome;

    atualizarSistema();
}

document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", function(event) {
        event.preventDefault();
        abrirPagina(this.dataset.pagina);
    });
});

// ========================================
// FORMULÁRIOS
// ========================================

function mostrarFormulario(id) {
    const formulario = document.getElementById(id);

    if (formulario) {
        formulario.classList.toggle("oculto");
    }
}

// ========================================
// CADASTRO DE CLIENTES
// ========================================

document.getElementById("formCliente")
.addEventListener("submit", function(event) {
    event.preventDefault();

    const cliente = {
        id: gerarId(),

        nome: document.getElementById("nomeCliente").value.trim(),

        cpf: document.getElementById("cpf").value.trim(),

        telefone: document.getElementById("telefoneCliente").value.trim(),

        email: document.getElementById("emailCliente").value.trim()
    };

    if (!cliente.nome || !cliente.telefone) {
        alert("Preencha o nome e o telefone do cliente.");
        return;
    }

    clientes.push(cliente);
    salvarDados();

    this.reset();
    this.classList.add("oculto");

    atualizarSistema();

    alert("Cliente cadastrado com sucesso!");
});

function listarClientes() {
    const lista = document.getElementById("listaClientes");

    lista.innerHTML = "";

    clientes.forEach(cliente => {
        const item = document.createElement("div");
        item.className = "registro";

        const informacoes = document.createElement("div");

        const nome = document.createElement("strong");
        nome.textContent = cliente.nome;

        const telefone = document.createElement("small");
        telefone.textContent = `Telefone: ${cliente.telefone}`;

        const cpf = document.createElement("small");
        cpf.textContent = cliente.cpf
            ? `CPF: ${cliente.cpf}`
            : "CPF não informado";

        informacoes.append(nome, telefone, cpf);

        const excluir = document.createElement("button");
        excluir.className = "excluir";
        excluir.textContent = "Excluir";
        excluir.onclick = () => excluirCliente(cliente.id);

        item.append(informacoes, excluir);
        lista.appendChild(item);
    });

    atualizarSelectClientes();
}

function excluirCliente(id) {
    const possuiReserva = reservas.some(
        reserva => reserva.clienteId === id
    );

    if (possuiReserva) {
        alert("Este cliente possui locações e não pode ser excluído.");
        return;
    }

    if (!confirm("Deseja excluir este cliente?")) return;

    clientes = clientes.filter(cliente => cliente.id !== id);

    salvarDados();
    atualizarSistema();
}

function atualizarSelectClientes() {
    const select = document.getElementById("clienteReserva");

    select.innerHTML = '<option value="">Selecione um cliente</option>';

    clientes.forEach(cliente => {
        const option = document.createElement("option");

        option.value = cliente.id;
        option.textContent = cliente.nome;

        select.appendChild(option);
    });
}

// ========================================
// CADASTRO DE TEMAS COM FOTOS
// ========================================

const campoFoto = document.getElementById("fotoTema");

campoFoto.addEventListener("change", function() {
    const arquivo = this.files[0];
    const preview = document.getElementById("previewTema");

    if (!arquivo) {
        preview.src = "";
        preview.classList.remove("visivel");
        return;
    }

    if (!arquivo.type.startsWith("image/")) {
        alert("Selecione um arquivo de imagem válido.");
        this.value = "";
        return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2 MB.");
        this.value = "";
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function(event) {
        preview.src = event.target.result;
        preview.classList.add("visivel");
    };

    leitor.readAsDataURL(arquivo);
});

document.getElementById("formTema")
.addEventListener("submit", function(event) {
    event.preventDefault();

    const arquivo = campoFoto.files[0];

    if (!arquivo || !arquivo.type.startsWith("image/")) {
        alert("Selecione uma foto válida para o tema.");
        return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2 MB.");
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function(event) {
        const tema = {
            id: gerarId(),

            nome: document.getElementById("nomeTema").value.trim(),

            descricao: document.getElementById("descricaoTema").value.trim(),

            preco: Number(document.getElementById("precoTema").value),

            foto: event.target.result
        };

        temas.push(tema);

        try {
            salvarDados();
        } catch (erro) {
            temas.pop();

            alert(
                "Não foi possível salvar o tema. " +
                "Escolha uma imagem menor ou libere espaço no navegador."
            );

            return;
        }

        thisFormularioTema.reset();

        document.getElementById("previewTema").src = "";
        document.getElementById("previewTema")
            .classList.remove("visivel");

        thisFormularioTema.classList.add("oculto");

        atualizarSistema();

        alert("Tema cadastrado com sucesso!");
    };

    const thisFormularioTema = this;

    leitor.onerror = function() {
        alert("Não foi possível ler a imagem.");
    };

    leitor.readAsDataURL(arquivo);
});

function listarTemas() {
    const lista = document.getElementById("listaTemas");

    lista.innerHTML = "";

    temas.forEach(tema => {
        const item = document.createElement("div");
        item.className = "registro tema";

        const informacoes = document.createElement("div");
        informacoes.className = "tema-informacoes";

        if (tema.foto) {
            const imagem = document.createElement("img");

            imagem.src = tema.foto;
            imagem.alt = tema.nome;
            imagem.className = "foto-tema";

            informacoes.appendChild(imagem);
        }

        const textos = document.createElement("div");

        const nome = document.createElement("strong");
        nome.textContent = tema.nome;

        const descricao = document.createElement("small");
        descricao.textContent = tema.descricao || "Sem descrição";

        const preco = document.createElement("small");
        preco.textContent = dinheiro(tema.preco);

        textos.append(nome, descricao, preco);
        informacoes.appendChild(textos);

        const excluir = document.createElement("button");
        excluir.className = "excluir";
        excluir.textContent = "Excluir";
        excluir.onclick = () => excluirTema(tema.id);

        item.append(informacoes, excluir);
        lista.appendChild(item);
    });

    atualizarSelectTemas();
}

function excluirTema(id) {
    const possuiReserva = reservas.some(
        reserva =>
            reserva.temaId === id &&
            reserva.status !== "Cancelada"
    );

    if (possuiReserva) {
        alert("Este tema possui locações ativas e não pode ser excluído.");
        return;
    }

    if (!confirm("Deseja excluir este tema?")) return;

    temas = temas.filter(tema => tema.id !== id);

    salvarDados();
    atualizarSistema();
}

function atualizarSelectTemas() {
    const select = document.getElementById("temaReserva");

    select.innerHTML = '<option value="">Selecione um tema</option>';

    temas.forEach(tema => {
        const option = document.createElement("option");

        option.value = tema.id;
        option.textContent = tema.nome;

        select.appendChild(option);
    });
}

document.getElementById("temaReserva")
.addEventListener("change", function() {
    const tema = temas.find(
        item => item.id === Number(this.value)
    );

    document.getElementById("valorReserva").value =
        tema ? tema.preco : "";
});

// ========================================
// DISPONIBILIDADE DOS TEMAS
// ========================================

function verificarDisponibilidade(temaId, retirada, devolucao) {
    return !reservas.some(reserva => {
        if (
            reserva.temaId !== temaId ||
            reserva.status === "Cancelada"
        ) {
            return false;
        }

        return (
            retirada < reserva.devolucao &&
            devolucao > reserva.retirada
        );
    });
}

// ========================================
// CADASTRO DE LOCAÇÕES
// ========================================

document.getElementById("formReserva")
.addEventListener("submit", function(event) {
    event.preventDefault();

    const clienteId = Number(
        document.getElementById("clienteReserva").value
    );

    const temaId = Number(
        document.getElementById("temaReserva").value
    );

    const evento = document.getElementById("dataEvento").value;

    const horarioEvento =
        document.getElementById("horarioEvento").value;

    const retirada =
        document.getElementById("dataRetirada").value;

    const horarioRetirada =
        document.getElementById("horarioRetirada").value;

    const devolucao =
        document.getElementById("dataDevolucao").value;

    const horarioDevolucao =
        document.getElementById("horarioDevolucao").value;

    const valor = Number(
        document.getElementById("valorReserva").value
    );

    // Verificação dos campos obrigatórios
    if (
        !clienteId ||
        !temaId ||
        !evento ||
        !horarioEvento ||
        !retirada ||
        !horarioRetirada ||
        !devolucao ||
        !horarioDevolucao ||
        !Number.isFinite(valor) ||
        valor < 0
    ) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    // Verificação do cliente e do tema
    if (
        !clientes.some(cliente => cliente.id === clienteId) ||
        !temas.some(tema => tema.id === temaId)
    ) {
        alert("Cliente ou tema inválido.");
        return;
    }

    // Verificação das datas
    if (devolucao < retirada) {
        alert("A devolução deve ser posterior à retirada.");
        return;
    }

    // Verificação da sequência completa de datas e horários
    const dataHoraRetirada = `${retirada}T${horarioRetirada}`;
    const dataHoraEvento = `${evento}T${horarioEvento}`;
    const dataHoraDevolucao = `${devolucao}T${horarioDevolucao}`;

    if (
        dataHoraEvento < dataHoraRetirada ||
        dataHoraEvento > dataHoraDevolucao
    ) {
        alert(
            "O evento deve acontecer entre a retirada e a devolução das peças."
        );
        return;
    }

    if (dataHoraDevolucao <= dataHoraRetirada) {
        alert("A devolução deve ocorrer depois da retirada.");
        return;
    }

    // Verificação de disponibilidade do tema
    if (!verificarDisponibilidade(temaId, retirada, devolucao)) {
        alert("Este tema já está reservado neste período!");
        return;
    }

    // Criação da locação
    const reserva = {
        id: gerarId(),

        clienteId,
        temaId,

        evento,
        horarioEvento,

        retirada,
        horarioRetirada,

        devolucao,
        horarioDevolucao,

        valor,

        status: "Pendente",
        recebido: 0
    };

    reservas.push(reserva);

    try {
        salvarDados();
    } catch (erro) {
        reservas.pop();

        alert("Não foi possível salvar a locação no navegador.");
        return;
    }

    this.reset();

    atualizarSistema();

    alert("Locação registrada com sucesso!");
});

// ========================================
// LISTAGEM DE LOCAÇÕES
// ========================================

function listarReservas() {
    const lista = document.getElementById("listaReservas");

    lista.innerHTML = "";

    reservas.forEach(reserva => {
        const cliente = clientes.find(
            item => item.id === reserva.clienteId
        );

        const tema = temas.find(
            item => item.id === reserva.temaId
        );

        const item = document.createElement("div");
        item.className = "registro";

        const informacoes = document.createElement("div");

        const titulo = document.createElement("strong");
        titulo.textContent = cliente?.nome || "Cliente removido";

        const temaInfo = document.createElement("small");
        temaInfo.textContent = `Tema: ${tema?.nome || "Tema removido"}`;

        const eventoInfo = document.createElement("small");
        eventoInfo.textContent =
            `Evento: ${formatarData(reserva.evento)} às ${reserva.horarioEvento || "--:--"}`;

        const retiradaInfo = document.createElement("small");
        retiradaInfo.textContent =
            `Retirada: ${formatarData(reserva.retirada)} às ${reserva.horarioRetirada || "--:--"}`;

        const devolucaoInfo = document.createElement("small");
        devolucaoInfo.textContent =
            `Devolução: ${formatarData(reserva.devolucao)} às ${reserva.horarioDevolucao || "--:--"}`;

        const valorInfo = document.createElement("small");
        valorInfo.textContent =
            `${dinheiro(reserva.valor)} | ${reserva.status}`;

        informacoes.append(
            titulo,
            temaInfo,
            eventoInfo,
            retiradaInfo,
            devolucaoInfo,
            valorInfo
        );

        const excluir = document.createElement("button");
        excluir.className = "excluir";
        excluir.textContent =
            reserva.status === "Cancelada" ? "Cancelada" : "Cancelar";

        excluir.disabled = reserva.status === "Cancelada";

        if (reserva.status !== "Cancelada") {
            excluir.onclick = () => cancelarReserva(reserva.id);
        }

        item.append(informacoes, excluir);

        lista.appendChild(item);
    });
}

function cancelarReserva(id) {
    if (!confirm("Deseja cancelar esta locação?")) return;

    reservas = reservas.map(reserva => {
        if (reserva.id === id) {
            return {
                ...reserva,
                status: "Cancelada"
            };
        }

        return reserva;
    });

    salvarDados();
    atualizarSistema();
}

// ========================================
// CALENDÁRIO
// ========================================

let dataCalendario = new Date();

const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

function mudarMes(valor) {
    dataCalendario.setMonth(
        dataCalendario.getMonth() + valor
    );

    montarCalendario();
}

function montarCalendario() {
    const calendario = document.getElementById("calendario");

    calendario.innerHTML = "";

    const ano = dataCalendario.getFullYear();
    const mes = dataCalendario.getMonth();

    document.getElementById("mesAtual").textContent =
        `${meses[mes]} de ${ano}`;

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    const hoje = new Date();

    // Espaços antes do primeiro dia do mês
    for (let i = 0; i < primeiroDia; i++) {
        const vazio = document.createElement("div");
        vazio.className = "dia-vazio";
        calendario.appendChild(vazio);
    }

    // Dias do mês
    for (let dia = 1; dia <= ultimoDia; dia++) {
        const celula = document.createElement("div");
        celula.className = "dia";

        if (
            dia === hoje.getDate() &&
            mes === hoje.getMonth() &&
            ano === hoje.getFullYear()
        ) {
            celula.classList.add("hoje");
        }

        const numero = document.createElement("strong");
        numero.textContent = dia;

        celula.appendChild(numero);

        const data =
            `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

        const reservasDoDia = reservas.filter(reserva =>
            reserva.evento === data &&
            reserva.status !== "Cancelada"
        );

        reservasDoDia.forEach(reserva => {
            const cliente = clientes.find(
                item => item.id === reserva.clienteId
            );

            const tema = temas.find(
                item => item.id === reserva.temaId
            );

            const eventoElemento = document.createElement("div");
            eventoElemento.className = "evento-calendario";

            eventoElemento.textContent =
                `${reserva.horarioEvento || "--:--"} - ${cliente?.nome || "Locação"}`;

            eventoElemento.title =
                `${tema?.nome || "Tema"} | Retirada: ${reserva.horarioRetirada || "--:--"} | Devolução: ${reserva.horarioDevolucao || "--:--"}`;

            celula.appendChild(eventoElemento);
        });

        calendario.appendChild(celula);
    }
}

// ========================================
// FINANCEIRO
// ========================================

function atualizarFinanceiro() {
    const ativas = reservas.filter(
        reserva => reserva.status !== "Cancelada"
    );

    const previsto = ativas.reduce(
        (total, reserva) => total + Number(reserva.valor || 0),
        0
    );

    const recebido = ativas.reduce(
        (total, reserva) => total + Number(reserva.recebido || 0),
        0
    );

    const pendente = previsto - recebido;

    document.getElementById("financeiroPrevisto").textContent =
        dinheiro(previsto);

    document.getElementById("financeiroRecebido").textContent =
        dinheiro(recebido);

    document.getElementById("financeiroPendente").textContent =
        dinheiro(pendente);

    const lista = document.getElementById("listaFinanceira");

    lista.innerHTML = "";

    ativas.forEach(reserva => {
        const cliente = clientes.find(
            item => item.id === reserva.clienteId
        );

        const item = document.createElement("div");
        item.className = "registro";

        const descricao = document.createElement("span");

        descricao.textContent =
            `${cliente?.nome || "Cliente"} - ${dinheiro(reserva.valor)}`;

        const recebidoInfo = document.createElement("span");

        recebidoInfo.textContent =
            `Recebido: ${dinheiro(reserva.recebido)}`;

        item.append(descricao, recebidoInfo);

        lista.appendChild(item);
    });
}

// ========================================
// DASHBOARD E RELATÓRIOS
// ========================================

function atualizarDashboard() {
    const ativas = reservas.filter(
        reserva => reserva.status !== "Cancelada"
    );

    document.getElementById("totalClientes").textContent =
        clientes.length;

    document.getElementById("totalTemas").textContent =
        temas.length;

    document.getElementById("totalReservas").textContent =
        ativas.length;

    document.getElementById("faturamento").textContent =
        dinheiro(
            ativas.reduce(
                (total, reserva) => total + Number(reserva.valor || 0),
                0
            )
        );

    document.getElementById("resumoRelatorio").textContent =
        `${clientes.length} clientes, ${temas.length} temas e ${ativas.length} locações ativas.`;
}

// ========================================
// ATUALIZAÇÃO GERAL
// ========================================

function atualizarSistema() {
    listarClientes();
    listarTemas();
    listarReservas();
    atualizarDashboard();
    atualizarFinanceiro();
    montarCalendario();
}

// ========================================
// INICIALIZAÇÃO
// ========================================

atualizarSistema();
