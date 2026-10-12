# Desenho do case Tavus CRM

Este arquivo contém propostas de arquitetura e avaliação, não garantias de funcionalidade nativa da Tavus.

## Jornada inicial sugerida

Lead entra na experiência → backend identifica contexto autorizado → cria Conversation → PAL descobre necessidades e responde com conhecimento aprovado → ferramentas consultam CRM/agendamento → lead confirma informações → resultado estruturado vira atividade e próximo passo → sessão encerra → transcrição e resultados finais são reconciliados.

Escolha uma jornada para o MVP. Qualificação inbound é um ponto inicial coerente com o exemplo oficial SDR, mas confirme o objetivo do case. Não presumir ligações telefônicas outbound, disparos de email ou conectores CRM prontos.

## Separação de responsabilidades

| Componente | Responsabilidade proposta |
| --- | --- |
| Frontend | Vídeo, estados de sessão, permissões de mídia, interação |
| Backend | Autenticação, contexto, criação/encerramento Tavus, autorização de tools |
| Tavus | PAL, Face, pipeline e conversa |
| Adaptador CRM | Mapeamento de campos e operações específicas do fornecedor |
| Banco/fila | Correlação, idempotência, histórico e recuperação |
| CRM | Fonte de verdade para contatos, atividades e oportunidades |

Tools candidatas: consultar contato, registrar informação confirmada, consultar disponibilidade, agendar encontro e criar tarefa. Esses nomes não são endpoints Tavus. Expor ações pequenas com schema restrito; o backend determina tenant e registros permitidos. Só anunciar reunião agendada ou registro atualizado após confirmação de sucesso.

## Dados mínimos propostos

Session: tenant_id, user_id/contact_id autorizado, conversation_id, pal_id, face_id, estado e timestamps. Outcome: necessidade, produto de interesse, prazo, orçamento quando pertinente, objeções, próximo passo, campos ainda desconhecidos e evidência de origem. Activity: resumo, origem da transcrição, status de sincronização, erro e chave de idempotência.

Preservar diferenças entre declaração do lead, inferência do modelo e dado CRM. Valor ausente fica desconhecido; não inventar orçamento ou intenção. Não usar emoção inferida como prova de capacidade de compra ou qualificação.

## Prompt do agente

Definir identidade de assistente IA, objetivo comercial, perguntas necessárias, conhecimento permitido, estilo de fala curto, condições para chamar tools e critérios de handoff. Personalização de contato entra como contexto, mantendo regras de autorização no backend. Confirmar nomes, emails e datas quando ambíguos. Preços/descontos devem vir de fonte aprovada. Se houver objeção, responder à dúvida antes de avançar.

## Evidência para o case

Apresentar problema e fluxo atual, segmento, jornada proposta, papel específico do vídeo, arquitetura, demonstração e limites do MVP. Diferenciar implementado, mock e roadmap. Comparar com o processo anterior e considerar alternativa de chat/voz quando vídeo não agrega valor.

Métricas possíveis: início→entrada na sessão, conclusão da qualificação, completude dos campos, sucesso das tools, atraso de sincronização, duplicatas CRM, agendamentos confirmados, handoff e custo por resultado. Separar conversão por sessão iniciada e por lead elegível. Sem dados reais, mostrar fórmula e premissas de projeção, nunca uplift comprovado.

## Validação proporcional

Verificar criação em test_mode; depois, quando autorizado, realizar conversa real com dados de teste. Cobrir negação de mídia, abandono, tool indisponível, contato de outro tenant, evento duplicado, falha CRM e fechamento antes da transcrição final. Testar português e nomes do domínio com voz/modelo atuais. Asserções úteis verificam que nenhuma gravação CRM duplica, nenhum acesso cruza tenant e nenhum sucesso é anunciado sem resultado confirmado.
