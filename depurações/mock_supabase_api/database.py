"""
Módulo de simulação de banco de dados para o mock da API Supabase
Implementa um banco de dados em memória usando dicionários
"""
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any, Callable

# Banco de dados em memória
db = {
    "auth": {
        "users": []
    },
    "tables": {
        "refeicoes": [],
        "hidratacao": [],
        "notas_autoconhecimento": [],
        "user_preferences": []
    },
    "subscriptions": {
        "refeicoes": [],
        "hidratacao": [],
        "notas_autoconhecimento": [],
        "user_preferences": []
    }
}

# Estrutura das tabelas conforme o schema SQL
SCHEMAS = {
    "refeicoes": [
        "id", "user_id", "data", "tipo", "horario", 
        "descricao", "tipo_icone", "foto", "created_at"
    ],
    "hidratacao": [
        "id", "user_id", "data", "quantidade_ml", 
        "meta_diaria_ml", "ultimo_registro", "created_at"
    ],
    "notas_autoconhecimento": [
        "id", "user_id", "categoria", "titulo", "conteudo",
        "created_at", "updated_at"
    ],
    "user_preferences": [
        "id", "user_id", "alto_contraste", "reducao_estimulos", 
        "texto_grande", "modo_refugio", "created_at", "updated_at"
    ]
}

# Simular políticas RLS
RLS_POLICIES = {
    "refeicoes": lambda user_id, record: record.get("user_id") == user_id,
    "hidratacao": lambda user_id, record: record.get("user_id") == user_id,
    "notas_autoconhecimento": lambda user_id, record: record.get("user_id") == user_id,
    "user_preferences": lambda user_id, record: record.get("user_id") == user_id
}

class Database:
    @staticmethod
    def add_user(email: str, password: str) -> Dict[str, Any]:
        """Adiciona um usuário ao banco de dados"""
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "email": email,
            "password": password,  # Na vida real, isso seria um hash
            "created_at": datetime.now().isoformat()
        }
        db["auth"]["users"].append(user)
        return user

    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Busca um usuário pelo email"""
        for user in db["auth"]["users"]:
            if user["email"] == email:
                return user
        return None

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        """Busca um usuário pelo ID"""
        for user in db["auth"]["users"]:
            if user["id"] == user_id:
                return user
        return None

    @classmethod
    def select(cls, table: str, user_id: Optional[str] = None, 
              filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Seleciona registros de uma tabela, aplicando filtros RLS
        
        Args:
            table: Nome da tabela
            user_id: ID do usuário para aplicar RLS
            filters: Dicionário de filtros no formato {coluna: valor}
            
        Returns:
            Dict com data (registros) e error (None ou mensagem de erro)
        """
        if table not in db["tables"]:
            return {"data": None, "error": {"message": f"Tabela {table} não existe", "code": "PGRST205"}}
        
        results = []
        for record in db["tables"][table]:
            # Aplicar RLS se user_id estiver presente
            if user_id and not RLS_POLICIES[table](user_id, record):
                continue
                
            # Aplicar filtros adicionais
            if filters:
                match = True
                for key, value in filters.items():
                    if key in record and record[key] != value:
                        match = False
                        break
                if not match:
                    continue
                    
            results.append(record.copy())
            
        return {"data": results, "error": None}

    @classmethod
    def insert(cls, table: str, data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Insere um registro em uma tabela
        
        Args:
            table: Nome da tabela
            data: Dados a serem inseridos
            user_id: ID do usuário para aplicar RLS na inserção
            
        Returns:
            Dict com data (registro inserido) e error (None ou mensagem de erro)
        """
        if table not in db["tables"]:
            return {"data": None, "error": {"message": f"Tabela {table} não existe", "code": "PGRST205"}}
            
        # Validar se o user_id no registro corresponde ao usuário autenticado
        if user_id and data.get("user_id") and data["user_id"] != user_id:
            return {
                "data": None, 
                "error": {"message": "Violação de política RLS", "code": "42501"}
            }
            
        # Gerar ID se não fornecido
        if "id" not in data:
            data["id"] = str(uuid.uuid4())
            
        # Adicionar created_at se não fornecido
        if "created_at" not in data:
            data["created_at"] = datetime.now().isoformat()
            
        # Adicionar o registro à tabela
        db["tables"][table].append(data.copy())
        
        # Notificar subscriptions
        cls._notify_subscribers(table, "INSERT", data)
        
        return {"data": [data], "error": None}

    @classmethod
    def update(cls, table: str, record_id: str, updates: Dict[str, Any], 
              user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Atualiza um registro em uma tabela
        
        Args:
            table: Nome da tabela
            record_id: ID do registro a ser atualizado
            updates: Campos a serem atualizados
            user_id: ID do usuário para aplicar RLS
            
        Returns:
            Dict com data (registro atualizado) e error (None ou mensagem de erro)
        """
        if table not in db["tables"]:
            return {"data": None, "error": {"message": f"Tabela {table} não existe", "code": "PGRST205"}}
            
        for i, record in enumerate(db["tables"][table]):
            if record["id"] == record_id:
                # Verificar RLS
                if user_id and not RLS_POLICIES[table](user_id, record):
                    return {
                        "data": None, 
                        "error": {"message": "Violação de política RLS", "code": "42501"}
                    }
                
                # Atualizar o registro
                updated_record = record.copy()
                for key, value in updates.items():
                    if key in SCHEMAS[table]:
                        updated_record[key] = value
                
                # Sempre atualizar o timestamp
                updated_record["updated_at"] = datetime.now().isoformat()
                
                # Substituir o registro na tabela
                db["tables"][table][i] = updated_record
                
                # Notificar subscriptions
                cls._notify_subscribers(table, "UPDATE", updated_record)
                
                return {"data": [updated_record], "error": None}
                
        return {
            "data": None, 
            "error": {"message": f"Registro com ID {record_id} não encontrado", "code": "PGRST116"}
        }

    @classmethod
    def delete(cls, table: str, record_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Remove um registro de uma tabela
        
        Args:
            table: Nome da tabela
            record_id: ID do registro a ser removido
            user_id: ID do usuário para aplicar RLS
            
        Returns:
            Dict com data (None) e error (None ou mensagem de erro)
        """
        if table not in db["tables"]:
            return {"data": None, "error": {"message": f"Tabela {table} não existe", "code": "PGRST205"}}
            
        for i, record in enumerate(db["tables"][table]):
            if record["id"] == record_id:
                # Verificar RLS
                if user_id and not RLS_POLICIES[table](user_id, record):
                    return {
                        "data": None, 
                        "error": {"message": "Violação de política RLS", "code": "42501"}
                    }
                
                # Guardar o registro para notificação
                deleted_record = record.copy()
                
                # Remover o registro da tabela
                db["tables"][table].pop(i)
                
                # Notificar subscriptions
                cls._notify_subscribers(table, "DELETE", deleted_record)
                
                return {"data": None, "error": None}
                
        return {
            "data": None, 
            "error": {"message": f"Registro com ID {record_id} não encontrado", "code": "PGRST116"}
        }

    @staticmethod
    def subscribe(table: str, callback: Callable[[str, Dict[str, Any]], None], 
                 filter_func: Optional[Callable[[Dict[str, Any]], bool]] = None) -> str:
        """
        Adiciona uma subscription a uma tabela
        
        Args:
            table: Nome da tabela
            callback: Função a ser chamada quando houver mudanças
            filter_func: Função opcional para filtrar eventos
            
        Returns:
            ID da subscription
        """
        if table not in db["subscriptions"]:
            return None
            
        subscription_id = str(uuid.uuid4())
        db["subscriptions"][table].append({
            "id": subscription_id,
            "callback": callback,
            "filter": filter_func
        })
        
        return subscription_id

    @staticmethod
    def unsubscribe(table: str, subscription_id: str) -> bool:
        """Remove uma subscription"""
        if table not in db["subscriptions"]:
            return False
            
        for i, subscription in enumerate(db["subscriptions"][table]):
            if subscription["id"] == subscription_id:
                db["subscriptions"][table].pop(i)
                return True
                
        return False

    @staticmethod
    def _notify_subscribers(table: str, event_type: str, record: Dict[str, Any]) -> None:
        """Notifica todas as subscriptions ativas para uma tabela"""
        if table not in db["subscriptions"]:
            return
            
        for subscription in db["subscriptions"][table]:
            # Aplicar filtro se existir
            if subscription.get("filter") and not subscription["filter"](record):
                continue
                
            # Construir payload similar ao Supabase
            payload = {
                "eventType": event_type,
                "new": record if event_type != "DELETE" else None,
                "old": record if event_type == "DELETE" else None,
                "table": table,
                "schema": "public"
            }
            
            # Chamar o callback
            subscription["callback"](event_type, payload)

# Inicializar alguns dados de exemplo
def init_sample_data():
    """Inicializa o banco de dados com alguns dados de amostra"""
    # Criar usuário de teste
    test_user = Database.add_user("teste@email.com", "senha123")
    user_id = test_user["id"]
    
    # Adicionar refeições planejadas
    refeicoes_data = [
        {
            "user_id": user_id,
            "data": datetime.now().isoformat(),
            "tipo": "planejada",
            "horario": "08:00",
            "descricao": "Café da manhã",
            "tipo_icone": "cafe",
            "foto": None
        },
        {
            "user_id": user_id,
            "data": datetime.now().isoformat(),
            "tipo": "planejada",
            "horario": "12:00",
            "descricao": "Almoço",
            "tipo_icone": None,
            "foto": None
        }
    ]
    
    for refeicao in refeicoes_data:
        Database.insert("refeicoes", refeicao)
    
    # Adicionar dados de hidratação
    hidratacao_data = {
        "user_id": user_id,
        "data": datetime.now().strftime("%Y-%m-%d"),
        "quantidade_ml": 750,
        "meta_diaria_ml": 2000,
        "ultimo_registro": "10:30"
    }
    
    Database.insert("hidratacao", hidratacao_data)
    
    # Adicionar notas de autoconhecimento de exemplo
    notas_autoconhecimento_data = [
        {
            "user_id": user_id,
            "categoria": "quem_sou",
            "titulo": "Minhas preferências",
            "conteudo": "Gosto de estudar em ambientes calmos com música ambiente."
        },
        {
            "user_id": user_id,
            "categoria": "meus_porques",
            "titulo": "Por que escolhi esta carreira",
            "conteudo": "Escolhi trabalhar com tecnologia porque adoro resolver problemas e criar soluções."
        },
        {
            "user_id": user_id,
            "categoria": "meus_padroes",
            "titulo": "Como lido com o estresse",
            "conteudo": "Quando estou estressado, respiro profundamente e faço uma pausa de 5 minutos."
        }
    ]
    
    for nota in notas_autoconhecimento_data:
        Database.insert("notas_autoconhecimento", nota)
    
    # Adicionar preferências do usuário
    user_preferences_data = {
        "user_id": user_id,
        "alto_contraste": False,
        "reducao_estimulos": False,
        "texto_grande": False,
        "modo_refugio": False
    }
    
    Database.insert("user_preferences", user_preferences_data)

# Inicializar dados de exemplo quando o módulo for carregado
init_sample_data() 