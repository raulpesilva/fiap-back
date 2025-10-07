# Farm FIAP - BACK

## Contexto do projeto

O Farm FIAP é uma aplicação desenvolvida no contexto da pós-graduação em Front-end Engineering da FIAP, com o objetivo de aplicar conceitos modernos de arquitetura front-end, componentização, integração de micro front-end e boas práticas de desenvolvimento.

O sistema foi pensado para gestão agrícola e de fazendas, permitindo organizar vendas, estoques, metas e produtos de forma simples e escalável.

&nbsp;

## Composição do projeto

O sistema é composto por diferentes aplicações que se integram entre si:

[Projeto Back-End](https://github.com/raulpesilva/fiap-back): Responsável pela API e regras de negócio, fornecendo os dados para os aplicativos web e mobile.

[Aplicativo Mobile](https://github.com/raulpesilva/farm-app): Interface voltada para dispositivos móveis, consumindo os serviços do back-end.

[Aplicativo Web - Container](https://github.com/raulpesilva/fiap-farm-container): Projeto principal que centraliza o micro front-end, gerencia rotas e autenticação e consome os serviços do back-end.

[Aplicativo Web - Micro front-end](https://github.com/raulpesilva/fiap-farm-mfe): Funcionalidade específica dividida em um módulo independente, que é carregado dinamicamente no container.

&nbsp;

## Tecnologias utilizadas

### Front-end

React: Biblioteca JavaScript para construção de interfaces de usuário.

Vite: Ferramenta de build e dev server ultrarrápido, otimizada para projetos modernos.

TailwindCSS: Framework de CSS utilitário para criação de interfaces responsivas e consistentes.

shadcn/ui: Biblioteca de componentes acessíveis e personalizáveis construída sobre Radix UI e Tailwind.

Lucide-react: Conjunto de ícones em SVG otimizados para React.

Recharts: Biblioteca de gráficos para React, facilitando a criação de visualizações de dados interativas.

React Day Picker: Biblioteca para construção de seletores de data flexíveis e acessíveis.

React Router Dom: Biblioteca de roteamento declarativo para navegação em aplicações React.

Re-State: Biblioteca para gerenciamento de estado global de forma simples e reativa.

&nbsp;

### Back-end e segurança

Fastify: Framework web rápido e eficiente para Node.js, utilizado para construir a API do back-end.

Socket.io: WebSocket para comunicação em tempo real com o app e web.

Jose: Biblioteca para manipulação de tokens JWT (JSON Web Tokens), que pode ser utilizada para autenticação e autorização.

&nbsp;

### Documentação e qualidade de código

ESLint: Ferramenta de linting para identificar e corrigir problemas no código.

Prettier: Formatador de código para manter a consistência e padronização.

&nbsp;

### Ferramentas de desenvolvimento

TypeScript: Superconjunto tipado do JavaScript, trazendo mais segurança ao código durante o desenvolvimento.

&nbsp;

## Como Executar o Projeto

### Variáveis de ambiente

Para executar a aplicação, é preciso criar um arquivo `.env` seguindo o `.example.env` localizado na raiz do projeto

&nbsp;

### Para rodar o projeto localmente, siga os passos abaixo

1. Clone o repositório do back-end:

```shell
git clone https://github.com/raulpesilva/fiap-back
```

2. Acesse o diretório do projeto do back-end:

```shell
cd fiap-back
```

3. Instale as dependências:

```shell
pnpm install
```

4. Execute o back-end:

```shell
pnpm dev
```

5. API disponível em http://localhost:4013/

&nbsp;

#### Nota:

```
pode usar o docker file para rodar
```

&nbsp;

## Projeto Publicado

É possível acessar o projeto publicado em: https://fiap-farm.raulpesilva.com/
