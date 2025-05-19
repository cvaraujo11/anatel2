"""
API FastAPI para simular o Supabase durante o desenvolvimento
"""
import os
import uvicorn
import jwt
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, Depends, HTTPException, WebSocket, status, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import Database
from schemas.models import (
    SignUpRequest, LoginRequest, UserResponse, SessionResponse,
    AuthResponse, SupabaseResponse, RefeicaoCreate, RefeicaoUpdate,
    HidratacaoCreate, HidratacaoUpdate, NotaAutoconhecimentoCreate,
    NotaAutoconhecimentoUpdate, UserPreferencesCreate, UserPreferencesUpdate
)

# Configuração do JWT
SECRET_KEY = "sua_chave_secreta_deve_ser_complexa_em_producao"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 horas

app = FastAPI(title="Mock Supabase API", description="API para simular o Supabase durante desenvolvimento")

# Configurar CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique as origens
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexões WebSocket ativas para simulação de realtime
active_connections: Dict[str, List[WebSocket]] = {
    "refeicoes": [],
    "hidratacao": []
}

# === Utilitários de autenticação ===

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Cria um token JWT para o usuário"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """Extrai o usuário atual do token JWT"""
    if not authorization:
        return None
        
    try:
        # Formato: "Bearer <token>"
        token = authorization.split("Bearer ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return Database.get_user_by_id(user_id)
    except Exception:
        return None

# === Rotas de Autenticação ===

@app.post("/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Simula o login no Supabase"""
    user = Database.get_user_by_email(request.email)
    
    if not user or user["password"] != request.password:
        return {
            "data": None,
            "error": {"message": "Credenciais inválidas", "code": "PGRST401"}
        }
    
    # Criar token JWT
    token = create_access_token({"sub": user["id"]})
    
    # Remover password antes de retornar
    user_response = {k: v for k, v in user.items() if k != "password"}
    
    return {
        "data": {
            "session": {
                "access_token": token,
                "token_type": "bearer",
                "user": user_response
            },
            "user": user_response
        },
        "error": None
    }

@app.post("/auth/signup", response_model=AuthResponse)
async def signup(request: SignUpRequest):
    """Simula o registro no Supabase"""
    existing_user = Database.get_user_by_email(request.email)
    
    if existing_user:
        return {
            "data": None,
            "error": {"message": "Email já registrado", "code": "23505"}
        }
    
    user = Database.add_user(request.email, request.password)
    
    # Criar token JWT
    token = create_access_token({"sub": user["id"]})
    
    # Remover password antes de retornar
    user_response = {k: v for k, v in user.items() if k != "password"}
    
    return {
        "data": {
            "session": {
                "access_token": token,
                "token_type": "bearer",
                "user": user_response
            },
            "user": user_response
        },
        "error": None
    }

@app.post("/auth/logout", response_model=AuthResponse)
async def logout():
    """Simula o logout no Supabase"""
    # No Supabase real, o token seria invalidado no servidor
    return {"data": None, "error": None}

@app.get("/auth/session", response_model=AuthResponse)
async def get_session(user = Depends(get_current_user)):
    """Retorna a sessão atual do usuário"""
    if not user:
        return {
            "data": {"session": None},
            "error": None
        }
    
    # Remover password antes de retornar
    user_response = {k: v for k, v in user.items() if k != "password"}
    
    return {
        "data": {
            "session": {
                "user": user_response
            }
        },
        "error": None
    }

# === Rotas de Refeições ===

@app.get("/refeicoes", response_model=SupabaseResponse)
async def get_refeicoes(
    tipo: Optional[str] = None,
    user = Depends(get_current_user)
):
    """Lista todas as refeições, com filtro opcional por tipo"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    filters = {}
    if tipo:
        filters["tipo"] = tipo
    
    return Database.select("refeicoes", user["id"], filters)

@app.post("/refeicoes", response_model=SupabaseResponse)
async def create_refeicao(
    refeicao: RefeicaoCreate,
    user = Depends(get_current_user)
):
    """Cria uma nova refeição"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    # Garantir que o user_id corresponde ao usuário autenticado
    if refeicao.user_id != user["id"]:
        return {"data": None, "error": {"message": "Violação de política RLS", "code": "42501"}}
    
    return Database.insert("refeicoes", refeicao.dict(), user["id"])

@app.patch("/refeicoes/{refeicao_id}", response_model=SupabaseResponse)
async def update_refeicao(
    refeicao_id: str,
    refeicao: RefeicaoUpdate,
    user = Depends(get_current_user)
):
    """Atualiza uma refeição existente"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    # Filtrar campos None (não informados)
    updates = {k: v for k, v in refeicao.dict().items() if v is not None}
    
    return Database.update("refeicoes", refeicao_id, updates, user["id"])

@app.delete("/refeicoes/{refeicao_id}", response_model=SupabaseResponse)
async def delete_refeicao(
    refeicao_id: str,
    user = Depends(get_current_user)
):
    """Remove uma refeição"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    return Database.delete("refeicoes", refeicao_id, user["id"])

# === Rotas de Hidratação ===

@app.get("/hidratacao", response_model=SupabaseResponse)
async def get_hidratacao(
    data: Optional[str] = None,
    user = Depends(get_current_user)
):
    """Obtém registros de hidratação para o usuário atual"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    filters = {}
    if data:
        filters["data"] = data
    
    result = Database.select("hidratacao", user["id"], filters)
    
    # Simulando o comportamento .single() do Supabase
    if result["data"] and len(result["data"]) > 0:
        return {"data": result["data"][0], "error": None}
    else:
        return {"data": None, "error": {"message": "Registro não encontrado", "code": "PGRST116"}}

@app.post("/hidratacao", response_model=SupabaseResponse)
async def create_hidratacao(
    hidratacao: HidratacaoCreate,
    user = Depends(get_current_user)
):
    """Cria ou atualiza o registro de hidratação para a data atual"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    # Garantir que o user_id corresponde ao usuário autenticado
    if hidratacao.user_id != user["id"]:
        return {"data": None, "error": {"message": "Violação de política RLS", "code": "42501"}}
    
    # Verificar se já existe um registro para o usuário e data
    filters = {"data": hidratacao.data}
    result = Database.select("hidratacao", user["id"], filters)
    
    if result["data"] and len(result["data"]) > 0:
        # Atualizar registro existente
        return Database.update("hidratacao", result["data"][0]["id"], hidratacao.dict(), user["id"])
    else:
        # Criar novo registro
        return Database.insert("hidratacao", hidratacao.dict(), user["id"])

@app.patch("/hidratacao/{hidratacao_id}", response_model=SupabaseResponse)
async def update_hidratacao(
    hidratacao_id: str,
    hidratacao: HidratacaoUpdate,
    user = Depends(get_current_user)
):
    """Atualiza um registro de hidratação"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    # Filtrar campos None (não informados)
    updates = {k: v for k, v in hidratacao.dict().items() if v is not None}
    
    return Database.update("hidratacao", hidratacao_id, updates, user["id"])

# === Rotas de Notas de Autoconhecimento ===

@app.get("/notas_autoconhecimento", response_model=SupabaseResponse)
async def get_notas_autoconhecimento(
    categoria: Optional[str] = None,
    user = Depends(get_current_user)
):
    """Lista todas as notas de autoconhecimento, com filtro opcional por categoria"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    filters = {}
    if categoria:
        filters["categoria"] = categoria
    
    return Database.select("notas_autoconhecimento", user["id"], filters)

@app.post("/notas_autoconhecimento", response_model=SupabaseResponse)
async def create_nota_autoconhecimento(
    nota: NotaAutoconhecimentoCreate,
    user = Depends(get_current_user)
):
    """Cria uma nova nota de autoconhecimento"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    # Garantir que o user_id corresponde ao usuário autenticado
    if nota.user_id != user["id"]:
        return {"data": None, "error": {"message": "Violação de política RLS", "code": "42501"}}
    
    return Database.insert("notas_autoconhecimento", nota.dict(), user["id"])

@app.patch("/notas_autoconhecimento/{nota_id}", response_model=SupabaseResponse)
async def update_nota_autoconhecimento(
    nota_id: str,
    nota: NotaAutoconhecimentoUpdate,
    user = Depends(get_current_user)
):
    """Atualiza uma nota de autoconhecimento existente"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    # Filtrar campos None (não informados)
    updates = {k: v for k, v in nota.dict().items() if v is not None}
    updates["updated_at"] = datetime.utcnow().isoformat()
    
    return Database.update("notas_autoconhecimento", nota_id, updates, user["id"])

@app.delete("/notas_autoconhecimento/{nota_id}", response_model=SupabaseResponse)
async def delete_nota_autoconhecimento(
    nota_id: str,
    user = Depends(get_current_user)
):
    """Remove uma nota de autoconhecimento"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    return Database.delete("notas_autoconhecimento", nota_id, user["id"])

# === Rotas de Preferências do Usuário ===

@app.get("/user_preferences", response_model=SupabaseResponse)
async def get_user_preferences(
    user = Depends(get_current_user)
):
    """Obtém as preferências do usuário atual"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    result = Database.select("user_preferences", user["id"])
    
    # Simulando o comportamento .single() do Supabase
    if result["data"] and len(result["data"]) > 0:
        return {"data": result["data"][0], "error": None}
    else:
        return {"data": None, "error": {"message": "Registro não encontrado", "code": "PGRST116"}}

@app.post("/user_preferences", response_model=SupabaseResponse)
async def create_user_preferences(
    preferences: UserPreferencesCreate,
    user = Depends(get_current_user)
):
    """Cria ou atualiza as preferências do usuário"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    # Garantir que o user_id corresponde ao usuário autenticado
    if preferences.user_id != user["id"]:
        return {"data": None, "error": {"message": "Violação de política RLS", "code": "42501"}}
    
    # Verificar se já existe um registro para o usuário
    result = Database.select("user_preferences", user["id"])
    
    if result["data"] and len(result["data"]) > 0:
        # Atualizar registro existente
        return Database.update("user_preferences", result["data"][0]["id"], preferences.dict(), user["id"])
    else:
        # Criar novo registro
        return Database.insert("user_preferences", preferences.dict(), user["id"])

@app.patch("/user_preferences/{preferences_id}", response_model=SupabaseResponse)
async def update_user_preferences(
    preferences_id: str,
    preferences: UserPreferencesUpdate,
    user = Depends(get_current_user)
):
    """Atualiza as preferências do usuário"""
    if not user:
        return {"data": None, "error": {"message": "Não autorizado", "code": "PGRST401"}}
    
    # Filtrar campos None (não informados)
    updates = {k: v for k, v in preferences.dict().items() if v is not None}
    updates["updated_at"] = datetime.utcnow().isoformat()
    
    return Database.update("user_preferences", preferences_id, updates, user["id"])

# === Simulação de Realtime via WebSockets ===

@app.websocket("/realtime/{table}")
async def websocket_endpoint(websocket: WebSocket, table: str):
    """Endpoint websocket para simulação de Realtime do Supabase"""
    if table not in active_connections:
        active_connections[table] = []
        
    await websocket.accept()
    active_connections[table].append(websocket)
    
    try:
        while True:
            # Manter a conexão aberta
            data = await websocket.receive_text()
            # Lógica para processar comandos do cliente pode ser adicionada aqui
    except Exception:
        # Remover websocket da lista quando desconectado
        active_connections[table].remove(websocket)

# Função para enviar atualizações realtime
async def broadcast_change(table: str, event_type: str, record: Dict[str, Any]):
    """Envia atualizações para todos os clientes conectados ao canal"""
    if table not in active_connections:
        return
        
    payload = {
        "eventType": event_type,
        "new": record if event_type != "DELETE" else None,
        "old": record if event_type == "DELETE" else None,
        "table": table,
        "schema": "public"
    }
    
    for connection in active_connections[table]:
        try:
            await connection.send_json(payload)
        except Exception:
            # Se a conexão estiver fechada, remover da lista
            active_connections[table].remove(connection)

# Adicionar listener para notificar WebSocket quando houver mudanças
Database._notify_subscribers = broadcast_change

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 