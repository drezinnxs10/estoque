let estoque = JSON.parse(localStorage.getItem('estoque')) || [];
let historico = JSON.parse(localStorage.getItem('historico')) || [];
let grafico;

// Dark Mode
if (localStorage.getItem('darkMode') === 'true') {
  document.documentElement.classList.add('dark');
}
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode',
    document.documentElement.classList.contains('dark'));
}


function salvar() {
  localStorage.setItem('estoque', JSON.stringify(estoque));
  localStorage.setItem('historico', JSON.stringify(historico));
}

// Adicionar produto
function adicionarProduto() {
  const produto = produtoInput.value.trim();
  let qtd = parseFloat(quantidadeInput.value);
  const unidade = unidadeInput.value;

  if (!produto || isNaN(qtd) || qtd <= 0) return alert('Dados inválidos');

  if (unidade === 'g') qtd /= 1000;

  estoque.push({ produto, quantidadeKg: qtd });
  historico.unshift({
    data: new Date().toLocaleString(),
    acao: 'Entrada',
    produto,
    quantidade: qtd
  });

  produtoInput.value = '';
  quantidadeInput.value = '';

  salvar();
  renderizarTudo();
}

// Alterar
function alterarQuantidade(i, valor) {
  estoque[i].quantidadeKg = Math.max(0, estoque[i].quantidadeKg + valor);

  historico.unshift({
    data: new Date().toLocaleString(),
    acao: valor > 0 ? 'Entrada' : 'Saída',
    produto: estoque[i].produto,
    quantidade: Math.abs(valor)
  });

  salvar();
  renderizarTudo();
}


function removerProduto(i) {
  historico.unshift({
    data: new Date().toLocaleString(),
    acao: 'Remoção',
    produto: estoque[i].produto,
    quantidade: estoque[i].quantidadeKg
  });

  estoque.splice(i, 1);
  salvar();
  renderizarTudo();
}

// Dashboard
function atualizarDashboard() {
  cardProdutos.innerText = estoque.length;
  cardPeso.innerText = estoque.reduce((t, p) => t + p.quantidadeKg, 0).toFixed(2);
  cardAlerta.innerText = estoque.filter(p => p.quantidadeKg <= 1).length;
}

// Render tabela
function renderizarTabela() {
  const busca = buscaInput.value.toLowerCase();
  const filtro = filtroSelect.value;
  listaEstoque.innerHTML = '';

  estoque
    .filter(p => p.produto.toLowerCase().includes(busca))
    .filter(p => filtro === 'baixo' ? p.quantidadeKg <= 1 : true)
    .forEach((p, i) => {
      listaEstoque.innerHTML += `
        <tr class="border-b dark:border-gray-700">
          <td class="p-2">${p.produto}</td>
          <td class="p-2 text-center">${p.quantidadeKg.toFixed(3)}</td>
          <td class="p-2 text-center space-x-1">
            <button onclick="alterarQuantidade(${i},0.1)"
              class="bg-secondary text-white px-2 rounded">+100g</button>
            <button onclick="alterarQuantidade(${i},-0.1)"
              class="bg-yellow-500 text-white px-2 rounded">-100g</button>
            <button onclick="removerProduto(${i})"
              class="bg-red-500 text-white px-2 rounded">X</button>
          </td>
        </tr>
      `;
    });
}

// Histórico
function renderizarHistorico() {
  historicoEl.innerHTML = '';
  historico.slice(0, 50).forEach(h => {
    historicoEl.innerHTML += `
      <li class="border-b pb-1">
        <strong>${h.data}</strong> – ${h.acao} – ${h.produto} (${h.quantidade.toFixed(3)}kg)
      </li>
    `;
  });
}

// Gráfico
function atualizarGrafico() {
  if (grafico) grafico.destroy();
  grafico = new Chart(graficoEl, {
    type: 'bar',
    data: {
      labels: estoque.map(p => p.produto),
      datasets: [{
        label: 'KG',
        data: estoque.map(p => p.quantidadeKg)
      }]
    }
  });
}

// Excel
function exportarExcel() {
  let csv = 'Produto,Quantidade(KG)\n';
  estoque.forEach(p => csv += `${p.produto},${p.quantidadeKg}\n`);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv]));
  a.download = 'estoque.csv';
  a.click();
}

// Render geral
function renderizarTudo() {
  atualizarDashboard();
  renderizarTabela();
  renderizarHistorico();
  atualizarGrafico();
}

// Elements
const produtoInput = document.getElementById('produto');
const quantidadeInput = document.getElementById('quantidade');
const unidadeInput = document.getElementById('unidade');
const buscaInput = document.getElementById('busca');
const filtroSelect = document.getElementById('filtro');
const listaEstoque = document.getElementById('listaEstoque');
const historicoEl = document.getElementById('historico');
const graficoEl = document.getElementById('graficoEstoque');
const cardProdutos = document.getElementById('cardProdutos');
const cardPeso = document.getElementById('cardPeso');
const cardAlerta = document.getElementById('cardAlerta');


renderizarTudo();
