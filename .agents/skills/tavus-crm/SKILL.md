---
name: tavus-crm
description: Planejar cases e implementar soluções Tavus com CVI, PALs, Faces, Voices, APIs, eventos e integração a CRM. Usar para arquitetura, prompts, protótipos e avaliação de soluções Tavus.
---

# Tavus CRM

Ajude a construir o case e a solução Tavus CRM do usuário. Responda em português por padrão. O CRM alvo, público e objetivo comercial devem vir do pedido; não assumir Salesforce, HubSpot ou outro fornecedor.

## Referências por tarefa

- Produto, nomenclatura, recursos e escolha de experiência: [produto.md](references/produto.md).
- Integração, autenticação, sessão, ferramentas e eventos: [api.md](references/api.md).
- Case, jornada comercial, modelo de dados, métricas e testes: [crm-case.md](references/crm-case.md).
- Documentação oficial e atualização: [fontes.md](references/fontes.md).

## Como trabalhar

Identifique o resultado solicitado: pesquisa, case, arquitetura, prompt, implementação ou diagnóstico. Avance com premissas explícitas; pergunte apenas sobre escolhas que mudem materialmente a solução.

Distinga recurso documentado da Tavus, proposta de integração e hipótese de negócio. “Tavus CRM” é o nome da solução do projeto, não evidência de um produto CRM nativo da Tavus. Não afirmar conector nativo para um fornecedor sem verificar.

Para código executável, consulte o OpenAPI oficial e as páginas relevantes naquele momento. As referências são uma síntese consultada em 12/10/2026, não um contrato congelado. Confira campos, tipos, enums, modelos, idiomas, limites, SDKs e recursos do plano antes de depender deles. Se a fonte estiver indisponível, identifique o ponto não verificado e preserve placeholders claros.

Use PAL, Face e Voice em novas soluções. Reconheça Persona/Replica em materiais legados e confira aliases antes de migrar. Não adaptar exemplos antigos por simples substituição textual.

Mantenha chaves Tavus e credenciais CRM no servidor. Vincule sessão a usuário/tenant/registro CRM no backend; argumentos gerados pelo PAL não estabelecem autorização. Memória conversacional não substitui a fonte de verdade CRM.

Ao implementar, cubra o ciclo completo: iniciar sessão, participar, executar ferramentas, persistir resultado comercial e encerrar. Verifique falhas relevantes e duplicidade de eventos. Diferencie validação local, test_mode e chamada real; criar uma skill não autoriza gastos ou operações em contas externas.

Ao preparar um case, conecte problema, público, jornada, papel da Tavus, integração CRM, demonstração e métricas. Use números reais quando fornecidos; projeções precisam declarar premissas.
