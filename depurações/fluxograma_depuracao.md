# Fluxograma de Decisão para Depuração da Refatoração Supabase

```mermaid
flowchart TD
    A[Início da Depuração] --> B{Erro durante\ncarregamento\nde dados?}
    
    B -->|Sim| C{Erro na\nAutenticação?}
    B -->|Não| D{Erro durante\nsalvamento\nde dados?}
    
    C -->|Sim| C1[Verificar token JWT e\nsessão do usuário]
    C1 --> C2[Verificar rota de autenticação\nna API mock]
    C2 --> C3[Corrigir uso do hook useAuth]
    
    C -->|Não| E{Erro com\npolíticas RLS?}
    
    E -->|Sim| E1[Verificar user_id nos dados\nenviados à API]
    E1 --> E2[Verificar simulação de\nRLS no backend mock]
    
    E -->|Não| F{Dados não\nencontrados?}
    
    F -->|Sim| F1[Verificar estrutura da tabela\ne campos na API mock]
    F1 --> F2[Comparar com o\nformato esperado no frontend]
    
    D -->|Sim| G{Erro de\nvalidação?}
    
    G -->|Sim| G1[Verificar formato dos\ndados enviados ao backend]
    G1 --> G2[Corrigir tipagem no\nfrontend ou backend]
    
    G -->|Não| H{Erro de\npermissão?}
    
    H -->|Sim| H1[Verificar RLS e\nautenticação]
    H -->|Não| I{Dados inválidos\nno banco?}
    
    I -->|Sim| I1[Verificar estrutura de inserção\ne modelos Pydantic]
    
    F -->|Não| J{Erro de\natualização\nem tempo real?}
    
    J -->|Sim| K{WebSocket\nconectado?}
    
    K -->|Não| K1[Verificar conexão WebSocket\nnas DevTools]
    K1 --> K2[Configurar cliente WebSocket\nno mock]
    
    K -->|Sim| L{Eventos chegam\nmas UI não atualiza?}
    
    L -->|Sim| L1[Verificar hook useEffect\ndo componente]
    L1 --> L2[Validar integração do canal\ncom estado local]
    
    D -->|Não| M{Problemas de\nsincronização\nentre dispositivos?}
    
    M -->|Sim| M1[Testar em duas\njanelas do navegador]
    M1 --> M2[Verificar conexões ativas\nno backend mock]
    M2 --> M3[Validar propagação de eventos\nentre as conexões]
    
    J -->|Não| N{Inconsistência\nde dados?}
    
    N -->|Sim| N1[Comparar resposta da API\ncom o esperado]
    N1 --> N2[Ajustar formato dos dados\nno mock ou frontend]
    
    N -->|Não| O{Comportamento\ndiferente entre\nmock e Supabase real?}
    
    O -->|Sim| O1[Comparar respostas entre\nmock e Supabase real]
    O1 --> O2[Ajustar mock para\nsimular Supabase fielmente]
    
    C3 --> P[Resolver problema]
    E2 --> P
    F2 --> P
    G2 --> P
    H1 --> P
    I1 --> P
    K2 --> P
    L2 --> P
    M3 --> P
    N2 --> P
    O2 --> P
    
    O -->|Não| Q[Problema não identificado\nVerificar logs adicionais]
    Q --> Q1[Adicionar mais logs de debug]
    Q1 --> Q2[Simular fluxo completo\npasso a passo]
    Q2 --> A
    
    P --> R[Testar novamente]
    R --> S{Problema\nresolvido?}
    
    S -->|Sim| T[Finalizar depuração\nDeletar logs de debug]
    S -->|Não| A
```

## Guia de Uso do Fluxograma

### Como Abordar Problemas durante a Depuração

1. **Identifique a categoria do problema**:
   - Problemas de carregamento de dados
   - Problemas de salvamento/atualização
   - Problemas de sincronização em tempo real
   - Inconsistências de dados

2. **Siga o caminho no fluxograma** correspondente ao tipo de problema
   
3. **Execute as ações recomendadas** em cada nó do fluxograma

4. **Teste novamente** após implementar as correções

5. **Repita o processo** se o problema persistir, adicionando mais logs de depuração

### Explicação dos Principais Nós

#### Problemas de Autenticação

Se houver problemas com autenticação, verifique:
- O token JWT está sendo gerado corretamente no backend
- O token está sendo armazenado corretamente no frontend
- O header `Authorization` está presente nas requisições

#### Problemas de RLS (Row Level Security)

Para problemas relacionados a permissões:
- Verifique se o `user_id` está sendo incluído nos dados enviados
- Confirme que a simulação de RLS no mock está funcionando
- Teste as políticas RLS com diferentes usuários

#### Problemas de WebSocket/Tempo Real

Se as atualizações em tempo real não funcionarem:
- Verifique se a conexão WebSocket foi estabelecida (DevTools > Network > WS)
- Confirme que o cliente está subscrito ao canal correto
- Verifique se os eventos estão sendo propagados para todas as conexões

#### Inconsistência de Dados

Para problemas de formato ou estrutura de dados:
- Compare a resposta da API mock com o formato esperado pelo frontend
- Verifique se todos os campos necessários estão presentes
- Ajuste o formato de dados no mock ou os modelos Pydantic

### Exemplo de Uso

1. Você detecta que os dados de hidratação não estão sendo carregados
2. Siga o fluxo de "Erro durante carregamento de dados"
3. Verifique se é um problema de autenticação, RLS ou dados não encontrados
4. Execute as ações recomendadas para o caso específico
5. Teste novamente para confirmar a resolução

Este fluxograma serve como guia para simplificar o processo de depuração, permitindo uma abordagem sistemática para resolver problemas durante a refatoração. 