# Integração API

## Contrato e autenticação

Base dos exemplos oficiais: https://tavusapi.com. Autenticação por header x-api-key; JSON nas requisições aplicáveis. Guardar a chave no backend. [Authentication](https://docs.tavus.io/api-reference/authentication).

O contrato HTTP canônico é [openapi.yaml](https://docs.tavus.io/openapi.yaml). Descubra operações e schemas ali: não derivar rotas de nomes de páginas. Famílias cobertas no índice incluem conversations, pals, faces, voices, tools, connectors, skills, memory stores, objectives, guardrails, documents, pronunciation dictionaries, deployments e canvas interactions.

POST /v2/pals cria PAL; edição usa JSON Patch. Publish PAL foi removido na documentação atual. Confira o schema antes de alterar layers, tools ou recursos associados. [Create PAL](https://docs.tavus.io/api-reference/pals/create-pal), [Patch PAL](https://docs.tavus.io/api-reference/pals/patch-pal).

## Sessão

POST /v2/conversations recebe pal_id e face_id, podendo usar a Face configurada no PAL. conversational_context fornece dados da sessão; callback_url recebe eventos. A resposta fornece conversation_id e conversation_url. require_auth cria sala privada e retorna meeting_token.

participant_tags aceita até uma tag estável para memória vinculada ao PAL; não combinar com o legado memory_stores. Em CRM multitenant, derivar a identidade no servidor. test_mode cria sessão encerrada sem entrada do PAL, útil para validar criação; não valida diálogo, percepção ou tools. [Create Conversation](https://docs.tavus.io/api-reference/conversations/create-conversation).

Use End Conversation para encerramento normal; Delete Conversation é remoção destrutiva. Confirme a rota exata no contrato. [End](https://docs.tavus.io/api-reference/conversations/end-conversation), [Delete](https://docs.tavus.io/api-reference/conversations/delete-conversation).

## Tools

Escolha um canal por tool: app_message ou delivery.api. Em app_message, correlacione conversation.tool_call com conversation.tool_result usando tool_call_id. O canal tem limite de 4 KB; considere API para cargas grandes.

Em delivery.api com HMAC, Tavus envia envelope fixo com conversation_id, tool_call_id e arguments como string JSON. Verifique X-Tavus-Signature, HMAC-SHA256 sobre bytes originais, antes de interpretar. Esse modo ignora templates de body/query/URL. Respostas 2xx são sucesso; há retry limitado para 5xx e erro de conexão. Idempotência deve impedir repetir efeitos CRM. [Tool Delivery](https://docs.tavus.io/sections/conversational-video-interface/pal/llm-tool-delivery).

Outros tipos de autenticação de tools atendem APIs externas; confira configurações e requisitos em [Tool Authentication](https://docs.tavus.io/sections/conversational-video-interface/pal/llm-tool-auth). Não transportar credenciais no prompt.

## Callbacks e pós-chamada

Eventos relevantes: system.pal_joined, system.shutdown, application.transcription_ready e application.post_call_action_executed. system.replica_joined é duplicata legada de entrada. Campos específicos ficam em properties. Gravação e análise perceptiva dependem de configuração. Transcrição final chega após término; shutdown não comprova que o resultado CRM já foi salvo. [Webhooks](https://docs.tavus.io/sections/webhooks-and-callbacks).

Não aplicar automaticamente a assinatura de tool delivery a callbacks de conversa: conferir o mecanismo documentado para cada canal. Persistir eventos recebidos, deduplicar e processar com recuperação. Os post-call tools são um caminho possível para extração/ação após a chamada; seu schema precisa ser confirmado em [Post-Call Actions](https://docs.tavus.io/sections/conversational-video-interface/pal/post-call-tool), cuja página não pôde ser aberta nesta pesquisa.
