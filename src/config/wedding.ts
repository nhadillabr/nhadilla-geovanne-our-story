/**
 * Todas as informações editáveis do site ficam neste arquivo.
 * Alterar aqui atualiza o site inteiro.
 */

export const wedding = {
  noivos: "Nhadilla & Geovanne",
  noiva: "Nhadilla",
  noivo: "Geovanne",
  dataTexto: "03 de julho de 2027",
  dataCurta: "03.07.2027",
  dataISO: "2027-07-03T00:00:00-03:00",
  cidade: "Uberlândia — MG",
  frase: "Uma nova história começa aqui.",
  /**
   * Foto do casal. Enquanto `placeholder` for true, o site exibe um aviso
   * discreto informando que a imagem é provisória.
   * Para trocar: substitua `heroImagem` pela URL da foto real e marque placeholder: false.
   */
  heroImagem: "",
  heroPlaceholder: true,
  textoListaConvidados:
    "Nosso casamento foi pensado com muito carinho e, para que possamos celebrar esse dia de forma íntima e especial, a lista de convidados foi cuidadosamente definida pelos noivos. Por isso, a confirmação de presença é nominal e exclusiva para os convidados indicados no convite. Agradecemos desde já pelo carinho e pela compreensão em fazer parte desse momento tão importante para nós.",
  textoPresentes:
    "Aos que desejam nos abençoar com um gesto de carinho, deixamos aqui algumas sugestões de presentes para o início da nossa vida juntos.",
  paletaTexto:
    "A paleta nasce de tons naturais e atemporais: o verde oliva como cor condutora, acompanhado por sálvia, marfim e bege, com acentos discretos em terracota, vinho, mostarda, marrom, cinza e azul petróleo. Uma composição sóbria, quente e elegante, pensada para envelhecer bem em cada fotografia.",
} as const;

export const paleta = [
  { nome: "Verde oliva", hex: "#6B7245" },
  { nome: "Verde sálvia", hex: "#9CA98C" },
  { nome: "Off-white / marfim", hex: "#F5F1E8" },
  { nome: "Bege", hex: "#D9C9AE" },
  { nome: "Terracota", hex: "#B4674B" },
  { nome: "Vinho", hex: "#6E2B36" },
  { nome: "Mostarda", hex: "#C39A3E" },
  { nome: "Marrom", hex: "#5C4632" },
  { nome: "Cinza", hex: "#8C8C88" },
  { nome: "Azul petróleo", hex: "#2E4C55" },
] as const;

export const categoriasPresentes = [
  "Casa",
  "Cozinha",
  "Quarto",
  "Eletrodomésticos",
  "Decoração",
  "Experiências",
] as const;

export const navegacao = [
  { label: "Home", to: "/" },
  { label: "O Casamento", to: "/o-casamento" },
  { label: "Lista de Presentes", to: "/lista-de-presentes" },
] as const;
