# Site de casamento — Nhadilla & Geovanne

Site oficial do casamento (03.07.2027, Uberlândia — MG), estética Old Money, editorial e minimalista, totalmente responsivo, com confirmação de presença real gravada em banco de dados e área administrativa protegida.

## Observação sobre a lista de presentes

O documento pede explicitamente uma vitrine com link para loja externa e **sem** carrinho, pagamento ou checkout. Vou seguir o documento: cada presente terá o botão "VER PRESENTE" que abre a loja externa em nova aba. Nenhum link será inventado — os presentes começam sem URL e você preenche pela área administrativa. Se preferir cotas com valores pagos no site, isso é outro caminho (exige pagamento) e podemos fazer depois.

## Identidade visual

- Paleta: off-white/marfim, verde oliva (destaque principal), verde sálvia, bege, terracota, vinho, mostarda, marrom, cinza, azul petróleo, com fio discreto em dourado envelhecido.
- Tipografia: serifada elegante para títulos (Cormorant Garamond), sans-serif refinada para textos (Karla).
- Muito espaço em branco, linhas finas, imagens grandes, animações apenas suaves (fade-in, hover, transições).
- Sem corações, flores em excesso, rosa, igrejinhas ou aparência de template genérico.

## Páginas públicas

1. **Home / Save the Date** — nomes, data, cidade, "Uma nova história começa aqui.", foto do casal em área claramente marcada como imagem provisória e fácil de trocar, contador regressivo funcional (dias/horas/minutos/segundos) e botões CONFIRMAR PRESENÇA, O CASAMENTO e LISTA DE PRESENTES.
2. **O Casamento** — página editorial com a seção Paleta de cores (amostras + texto de inspiração) e estrutura pronta para receber depois cerimônia, recepção, dress code, local, horários, nossa história, como chegar, hospedagem, FAQ e contato.
3. **Lista de Presentes** — grade sofisticada com imagem, nome, descrição curta, preço, categoria e botão VER PRESENTE; filtros por categoria (Casa, Cozinha, Quarto, Eletrodomésticos, Decoração, Experiências).
4. **RSVP** — busca pelo nome ou link individual `/rsvp/<código>`.

Menu discreto no topo com HOME, O CASAMENTO, LISTA DE PRESENTES; hambúrguer no celular. A área administrativa não aparece no menu.

## RSVP

- Busca pelo nome: mostra somente o convidado correspondente, nunca uma lista. Nomes parecidos são diferenciados de forma segura (confirmação por inicial do sobrenome), sem revelar dados de terceiros.
- Depois de identificado: "Olá, [NOME]." + mensagem de boas-vindas e duas opções: CONFIRMAR MINHA PRESENÇA / NÃO PODEREI COMPARECER.
- Grava status e data/hora; mensagens de retorno exatamente como no documento.
- O convidado pode voltar e trocar a resposta; não pode alterar nome nem qualquer outro dado.
- Sem nenhum campo de acompanhante, +1 ou quantidade.
- Texto elegante sobre a lista de convidados ser nominal, conforme o documento.

## Área administrativa

- Acesso por login (e-mail e senha), separado do site público, com permissão de administrador verificada no servidor.
- Painel com total de convidados, confirmados, pendentes e não comparecerão.
- Tabela de convidados: cadastrar, editar, excluir, pesquisar, filtrar por status, alterar status manualmente, ver data da confirmação, adicionar observações, exportar CSV, copiar o link individual de cada convidado.
- Gestão de presentes: adicionar, editar, excluir, preço, imagem, descrição, categoria, URL da loja, ativar/desativar.

## Detalhes técnicos

- Ativar Lovable Cloud (banco + autenticação).
- Tabelas: `guests` (id, nome, código individual, status pendente/confirmado/recusado, data_confirmacao, observações), `gifts` (nome, descrição, preço, imagem, categoria, url, ativo), `user_roles` (papel admin em tabela separada, com função `has_role` security definer).
- Segurança: RLS bloqueando qualquer leitura pública direta de `guests`; o público só interage por funções de servidor que devolvem exclusivamente o próprio convidado (busca por nome exato ou código) e atualizam somente o status. `gifts` ativos são públicos em leitura; escrita apenas para admin. Escrita/leitura completa de `guests` apenas para admin.
- Conteúdo editável centralizado em um arquivo de configuração do site (nomes, data, local, textos, imagens, paleta).
- Rotas TanStack: `/`, `/o-casamento`, `/lista-de-presentes`, `/rsvp`, `/rsvp/$codigo`, `/entrar`, `/admin`, `/admin/presentes`.
- SEO por página: título, descrição, Open Graph e Twitter, favicon e prévia elegante ao compartilhar.
