# Tavus CRM — PAL Test Case

Projeto de case e solução CRM com conversas multimodais em tempo real usando Tavus.

## Status

Protótipo local em HTML/CSS/JavaScript com tabela de leads e persistência no navegador. Integração real Tavus ainda não implementada.

## MVP proposto

Um SDR virtual conversa por vídeo, identifica as necessidades do lead e registra um resumo e o próximo passo em uma tabela simples. Sem integração com CRM externo, conforme escopo escolhido.

Abra `index.html` no navegador para usar o protótipo. Cadastre leads, selecione um registro e salve notas e o próximo passo. Dados ficam no localStorage deste navegador. A área Tavus indica configuração pendente; não simula uma conversa real.

Fluxo: identificar lead → criar sessão Tavus no backend → conversar → confirmar dados → registrar resultado → encerrar sessão → reconciliar transcrição final.

## Configuração

Copie `.env.example` para `.env.local` quando a aplicação for criada. Preencha os valores apenas localmente; nunca envie credenciais ao GitHub. O exemplo descreve a configuração planejada e ainda não é consumido por código.

- `TAVUS_API_KEY`: chave de API mantida no servidor.
- `TAVUS_PAL_ID`: PAL escolhido ou criado para o case.
- `TAVUS_FACE_ID`: Face escolhida; pode ser fornecida pela configuração do PAL.
- `APP_BASE_URL`: URL da aplicação.
- `TAVUS_CALLBACK_URL`: endpoint HTTPS público para eventos da conversa, após implementação.
- `CRM_PROVIDER`: CRM escolhido para o MVP.

## Organização

- `docs/mvp.md`: escopo e critérios de aceite propostos.
- `.agents/skills/tavus-crm/`: skill de produto, API e arquitetura CRM.
- `AGENTS.md`: instruções de trabalho para agentes neste repositório.

## Próximas etapas

1. Confirmar público e resultado principal da demonstração.
2. Escolher stack e implementar a aplicação com modo demonstrativo.
3. Configurar PAL/Face e integrar criação e encerramento de sessão.
4. Implementar registro de resultados e recuperação de falhas.
5. Validar a demonstração e documentar métricas reais.

## Referência

[Documentação Tavus](https://docs.tavus.io/api-reference/overview) · [Contrato OpenAPI](https://docs.tavus.io/openapi.yaml)
