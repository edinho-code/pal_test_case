# Produto e recursos

## Modelo mental

A Tavus oferece CVI (Conversational Video Interface), uma experiência de conversa multimodal em tempo real. PAL concentra comportamento, conhecimento e pipeline; Face fornece a representação visual; Voice representa a voz. Conversation é uma sessão concreta. A documentação atual mantém compatibilidade com nomes antigos Persona/Replica e seus endpoints/campos. [Overview](https://docs.tavus.io/api-reference/overview).

Phoenix é a família de geração visual; Raven está associado à percepção; Sparrow ao fluxo de turnos. Versões e opções devem ser consultadas em [Models](https://docs.tavus.io/sections/models). Não prometer latência, precisão ou qualidade universal a partir do nome do modelo.

## Escolha da experiência

- Pipeline completo para um agente que percebe, transcreve, raciocina e responde com voz/vídeo.
- Echo e integrações externas quando a aplicação controla partes do pipeline; conferir responsabilidades e protocolo em [Pipeline Modes](https://docs.tavus.io/sections/conversational-video-interface/quickstart/pipeline-modes).
- Aplicação própria para experiência e autorização sob controle do projeto. O quickstart integra uma sessão criada no servidor usando conversation_url. [CVI App](https://docs.tavus.io/sections/conversational-video-interface/quickstart/build-first-app).
- Deployments oferece caminhos hospedados de widget, embed e landing page; avaliar o nível de personalização requerido antes de escolher. [Guia](https://docs.tavus.io/sections/deployments/overview).

## Capacidades a investigar conforme necessidade

Knowledge Base para documentos; Objectives para resultados desejados; Guardrails para limites comportamentais; Memories para continuidade; tools para ações; connectors para servidores MCP; skills Tavus para capacidades anexadas ao PAL. Essas skills internas da Tavus são diferentes desta skill Codex.

O índice também cobre Magic Canvas, apresentações, busca, browser use, screen share, gravações, idiomas, mobile e participação em reuniões. A presença no índice não garante disponibilidade na conta. Abra o guia específico antes de definir configurações. [Índice oficial](https://docs.tavus.io/llms.txt).

## Casos de uso

O exemplo oficial AI SDR trata qualificação inbound e avanço para o próximo passo comercial. Use-o como referência de comportamento, recuperando a configuração atual em vez de fixar os IDs publicados. [SDR](https://docs.tavus.io/sections/conversational-video-interface/conversation/usecases/sales-development-representative).

O catálogo apresenta atendimento ao cliente, entrevistas e intake médico. Para o projeto CRM, onboarding, descoberta comercial, suporte e treinamento de vendedores são possibilidades de desenho a validar com o usuário, não integrações prontas presumidas.

## Estratégia de PAL

Reutilize PALs quando muda apenas o contexto do contato. Passe dados de sessão em conversational_context. Quando comportamento, tools, voz ou objetivos precisarem de isolamento, avalie PAL dedicado por tenant ou sessão. PATCH em PAL compartilhado pode atingir conversas em andamento; não use alterações globais para personalização de um lead. [PAL Strategies](https://docs.tavus.io/sections/onboarding-guide/pal-strategies).
