# MVP proposto

## Objetivo

Demonstrar uma jornada de qualificação de lead por conversa Tavus, com resultado estruturado em tabela simples, sem CRM externo.

## Decisões pendentes

- Decisão tomada: sem integração CRM externa; dados demonstrativos em tabela local.
- Segmento e produto oferecido pelo SDR.
- Stack, hospedagem e identificação de usuários.
- Campos de qualificação e definição de lead qualificado.

## Escopo inicial proposto

- Lista/detalhe de leads e histórico de atividades.
- Início e encerramento de conversa Tavus.
- PAL em português com perguntas de descoberta e conhecimento aprovado.
- Resumo, necessidades, informações confirmadas e próximo passo.
- Estados de sincronização e recuperação de falhas.

Agendamento automático e comunicação externa ficam para decisão posterior.

## Critérios de aceite

- Chave Tavus não aparece no navegador nem no repositório.
- Sessão está vinculada ao lead autorizado no backend.
- Usuário consegue iniciar e encerrar a conversa.
- Dados ausentes são apresentados como desconhecidos.
- Resultado salva uma atividade no lead correto; repetição de evento não duplica atividade.
- Falha de integração é visível e recuperável.
- Demonstração identifica claramente dados fictícios e integrações simuladas.

## Validação planejada

Validar primeiro o modo demonstrativo e criação de sessão em test_mode. Uma conversa real deve validar comportamento em português, tools e resultado comercial. Cobrir abandono, falha CRM e entrega repetida de evento.

## Métricas candidatas

Conclusão da qualificação, completude dos campos, sucesso da gravação CRM, tempo até o resultado e custo por qualificação. Não há resultados medidos nesta etapa.
