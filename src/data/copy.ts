// Todo o texto da página mora aqui. Nada de número, nome ou data fora deste arquivo.

export const marca = {
  nome: 'Mapere',
  url: 'https://mapere.com.br',
  instagram: { usuario: '@mapere.app', url: 'https://instagram.com/mapere.app' },
} as const;

// [A CONFIRMAR] Sem URL, o link "responda a pesquisa" não é renderizado.
export const links: { pesquisa: string | null } = { pesquisa: null };

export const seo = {
  titulo: 'Mapere · Saiba se o posto está livre antes de sair',
  descricao:
    'O Mapere mostra se o posto de recarga está livre e funcionando agora, com o status confirmado por quem está lá. Começando por Aracaju. Entre na lista de espera.',
  imagemAlt: 'Assinatura Mapere. com o ponto final aceso sobre a maquete noturna de Aracaju.',
} as const;

// Pesquisa própria, 14 a 18/10/2026. Conferida contra a planilha: 23 válidas de 24.
const n = (quantos: number, texto: string) => ({ quantos, de: 23, texto });
export const pesquisa = {
  base: 'Pesquisa Mapere com 23 motoristas de carro elétrico, out/2026.',
  dor: n(20, 'apontaram posto ocupado ou quebrado entre as maiores dores.'),
  naoRecarregou: n(16, 'já chegaram a um posto e não conseguiram recarregar.'),
  livreAgora: n(22, 'disseram que saber se o posto está livre agora é informação que não pode faltar.'),
  avisaria: n(16, 'avisariam o status sempre ou quase sempre.'),
  appPorRede: n(10, 'reclamaram de precisar de um app e um cadastro diferentes para cada rede.'),
  preco: n(13, 'querem ver o preço antes de sair.'),
} as const;

export type StatusId = 'livre' | 'ocupado' | 'defeito' | 'seminfo';

export const statusRotulo: Record<StatusId, { nome: string; curto: string }> = {
  livre: { nome: 'Livre', curto: 'Livre' },
  ocupado: { nome: 'Ocupado', curto: 'Ocupado' },
  defeito: { nome: 'Com defeito', curto: 'Defeito' },
  seminfo: { nome: 'Sem informação', curto: 'Sem info' },
};

export const indice = [
  { id: 'abertura', rotulo: 'Abertura' },
  { id: 'problema', rotulo: 'O problema' },
  { id: 'como-funciona', rotulo: 'Como funciona' },
  { id: 'status', rotulo: 'Os 4 status' },
  { id: 'redes', rotulo: 'Um mapa só' },
  { id: 'perguntas', rotulo: 'Perguntas' },
  { id: 'lista', rotulo: 'Lista de espera' },
] as const;

export const cabecalho = {
  pularConteudo: 'Pular para a lista de espera',
  lista: 'Lista',
  instagram: 'Instagram',
  indiceRotulo: 'Seções da página',
} as const;

export const abertura = {
  // "Saiba se o posto está livre antes de sair." em linhas, para quebrar sempre igual.
  titulo: { linhas: ['Saiba se o', 'posto está', 'antes', 'de sair.'], destaque: 'livre' },
  apoio: 'Quem está no posto confirma em poucos toques. Você vê o status de agora, no mapa.',
  lojas: 'Em breve no Android e no iPhone. Começando por Aracaju.',
  cena:
    'Cena: maquete noturna de Aracaju feita de renda e linho. A câmera mergulha até a rua, um fio de luz corre pela cidade e um posto de recarga acende.',
  passos: [
    'Você abre o mapa antes de sair.',
    'A luz segue até o posto mais perto.',
    'Alguém que está lá confirmou.',
  ],
  statusExemplo: 'há 4 min · 2 confirmações',
  rolar: 'Role para ver',
} as const;

export const problema = {
  titulo: { antes: 'Você só descobre ', destaque: 'chegando', depois: ' lá.' },
  apoio: 'Saber onde fica o posto é fácil. Saber se ele está livre e funcionando agora, não.',
  paradas: [
    { status: 'ocupado', dado: pesquisa.dor },
    { status: 'defeito', dado: pesquisa.naoRecarregou },
    { status: 'ocupado', dado: pesquisa.livreAgora },
  ],
  nota: 'Mapa de Aracaju com dados do OpenStreetMap. Pins ilustrativos.',
  cena:
    'Mapa em linha de Aracaju, com as ruas, o rio Sergipe e a costa. Uma rota parte da Atalaia e passa por três postos ilustrativos: o primeiro ocupado, o segundo com defeito, o terceiro ocupado.',
} as const;

export const telaExemplo = {
  posto: 'Posto Fio de Luz',
  endereco: 'Rua do Lacê, 100 · Aracaju, SE',
  distancia: '1,2 km · 4 min',
  confirmado: 'Confirmado há 4 min por 2 pessoas',
  confirmadoCurto: 'Confirmado há 4 min · 2 confirmações',
  confirmadoAgora: 'Confirmado agora · 3 confirmações',
  preco: 'R$ 2,10/kWh',
  potencia: '60 kW',
  busca: 'Buscar endereço ou bairro',
  chips: ['CCS2 · até 60 kW', 'Carga rápida', 'Só livres'],
  maisProximo: 'Mais próximo de você',
  verPosto: 'Ver posto',
  nav: ['Mapa', 'Favoritos', 'Alertas', 'Perfil'],
  conectores: [
    { nome: 'CCS2 · 60 kW', resumo: '2 de 2 livres', plugues: ['livre', 'livre'] },
    { nome: 'Tipo 2 · 22 kW', resumo: '1 de 2 ocupado', plugues: ['livre', 'ocupado'] },
  ],
  conectoresTitulo: 'Conectores',
  historicoTitulo: 'Histórico',
  historico: [
    { st: 'livre', texto: 'Você confirmou', quando: 'agora', novo: true },
    { st: 'livre', texto: 'Livre', quando: 'há 4 min', novo: false },
    { st: 'ocupado', texto: 'Ocupado', quando: 'há 38 min', novo: false },
  ],
  fazerCheckin: 'Fazer check-in',
  checkinFeito: 'Check-in feito',
  reportar: 'Reportar problema',
  abrirRota: 'Abrir rota',
  alerta: { titulo: 'Posto Fio de Luz está livre', texto: 'Confirmado agora por 3 pessoas.' },
  horaMapa: '17:42',
  horaDetalhe: '17:43',
} as const;

export const comoFunciona = {
  titulo: { antes: 'Consultar, ', destaque: 'confirmar,', depois: ' ser avisado.' },
  passos: [
    {
      nome: 'Consulte antes de sair',
      texto:
        'O mapa mostra o status de cada posto, há quanto tempo ele foi confirmado e por quantas pessoas. Preço e potência ficam no detalhe do posto.',
      exemplo: 'Livre · há 4 min · 2 confirmações',
      dado: pesquisa.preco,
    },
    {
      nome: 'Confirme quando chegar',
      texto: 'Quem está no posto avisa em poucos toques. O ponto acende e todo mundo vê na hora.',
      exemplo: 'Check-in feito · 3 confirmações',
      dado: pesquisa.avisaria,
    },
    {
      nome: 'Seja avisado',
      texto: 'O status do seu posto mudou? O alerta chega no celular antes de você sair.',
      exemplo: 'Alerta · Posto Fio de Luz está livre',
      dado: null,
    },
  ],
  legenda: 'Tela ilustrativa. Nome, endereço, preço e distâncias são fictícios.',
  cena:
    'Duas telas do app. Na primeira, um mapa de Aracaju com o Posto Fio de Luz, que muda de sem informação para livre. Na segunda, o detalhe do posto: um dedo toca em fazer check-in, o ponto acende no histórico e chega um alerta.',
} as const;

export const status = {
  titulo: { antes: 'Quatro status. Nenhum depende de ', destaque: 'cor.', depois: '' },
  apoio: 'Ícone e texto dizem tudo. A idade da informação fica colada ao status.',
  lista: [
    { id: 'livre', texto: 'Tem carregador disponível e funcionando.', exemplo: 'Livre · há 4 min · 2 confirmações' },
    { id: 'ocupado', texto: 'Todos em uso ou com fila.', exemplo: 'Ocupado · há 9 min · 1 confirmação' },
    { id: 'defeito', texto: 'Quebrado, fora do ar ou não iniciou a recarga.', exemplo: 'Com defeito · há 1 h · 2 confirmações' },
    { id: 'seminfo', texto: 'Ninguém confirmou há pouco tempo. O mapa não adivinha.', exemplo: 'Sem informação · sem confirmação recente' },
  ],
  cinza: 'Ver em escala de cinza',
  cinzaLigado: 'Sem cor nenhuma, os quatro continuam diferentes.',
  nota: 'Exemplos ilustrativos.',
} as const;

export const redes = {
  titulo: { antes: 'Um mapa para ', destaque: 'todas', depois: ' as redes.' },
  apoio: 'Postos de todas as redes no mesmo lugar, começando por Aracaju.',
  dado: pesquisa.appPorRede,
  pagamento: 'A recarga continua sendo paga à operadora.',
  rotulos: { centro: 'Centro', rio: 'Rio Sergipe', area: 'Área de lançamento', coordenadas: '10°54′S 37°04′O' },
  cena:
    'Desenho em arame de Aracaju vista do mar, com prédios e ruas do OpenStreetMap e o rio Sergipe em primeiro plano. Uma linha de luz contorna o município, a área de lançamento.',
} as const;

export const momento = {
  frase: { antes: 'Cada confirmação ', destaque: 'acende', depois: ' o mapa para quem vem depois.' },
} as const;

export const perguntas = {
  titulo: { antes: 'Perguntas ', destaque: 'frequentes', depois: '' },
  lista: [
    {
      p: 'O que é o Mapere?',
      r: 'Um app para donos de carro elétrico saberem se o posto de recarga está livre e funcionando agora, antes de sair.',
    },
    { p: 'Quando sai?', r: 'Em breve no Android e no iPhone. Entre na lista para saber primeiro.' },
    {
      p: 'De onde vem o status?',
      r: 'De quem está no posto. A pessoa confirma em poucos toques, e o app mostra há quanto tempo e por quantas pessoas a informação foi confirmada.',
    },
    {
      p: 'Pago a recarga pelo app?',
      r: 'Não. O pagamento continua com a operadora. No detalhe do posto você vê preço e potência.',
    },
    { p: 'Onde funciona?', r: 'Começando por Aracaju, com os postos de todas as redes num mapa só.' },
  ],
} as const;

export const lista = {
  titulo: { antes: 'Entre na ', destaque: 'lista', depois: ' de espera.' },
  apoio: 'A gente avisa por e-mail quando o Mapere abrir em Aracaju.',
} as const;

export const formulario = {
  rotuloEmail: 'Seu e-mail',
  placeholder: 'voce@email.com',
  botao: 'Entrar na lista',
  enviando: 'Enviando',
  consentimento: 'Aceito receber e-mails do Mapere sobre o lançamento.',
  privacidade: 'Privacidade',
  sucesso: 'Pronto. Você está na lista.',
  repetido: 'Este e-mail já está na lista.',
  erro: 'Não deu para salvar agora. Tente de novo em instantes.',
  emailInvalido: 'Confira o e-mail digitado.',
  semConsentimento: 'Marque o consentimento para entrar na lista.',
  indisponivel: 'A lista ainda não está aberta. Enquanto isso, siga o Instagram.',
  modoTeste: 'Modo de teste: nada é salvo de verdade.',
  semJavaScript: 'Para entrar na lista, ative o JavaScript ou fale com a gente no Instagram:',
} as const;

export const rodape = {
  instagram: 'Instagram',
  pesquisa: 'Responda a pesquisa',
  privacidade: 'Privacidade',
  osm: '© OpenStreetMap contributors',
  osmUrl: 'https://www.openstreetmap.org/copyright',
  atalhos: 'Atalhos de teclado',
  atalhosLigados: 'Ligados',
  atalhosDesligados: 'Desligados',
  direitos: '© 2026 Mapere',
} as const;

export const privacidade = {
  titulo: 'Privacidade',
  marca: '[A CONFIRMAR revisão]',
  voltar: 'Voltar para a página inicial',
  blocos: [
    {
      t: 'O que coletamos',
      r: 'Só o seu e-mail, a data do cadastro, o registro do seu consentimento e em qual formulário da página você se cadastrou.',
    },
    {
      t: 'Para quê',
      r: 'Para avisar por e-mail sobre o lançamento do Mapere.',
    },
    {
      t: 'Como pedir a exclusão',
      r: 'Mande uma mensagem para @mapere.app no Instagram pedindo para sair da lista. Você pode pedir a exclusão a qualquer momento, como prevê a LGPD.',
    },
  ],
} as const;
