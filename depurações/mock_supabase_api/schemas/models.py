"""
Modelos Pydantic para validação de dados na API
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Union, Dict, Any
from datetime import datetime

# === Autenticação ===

class SignUpRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime

class SessionResponse(BaseModel):
    user: Optional[UserResponse] = None
    
class AuthResponse(BaseModel):
    data: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None

# === Refeições ===

class RefeicaoBase(BaseModel):
    user_id: str
    data: str
    tipo: str
    horario: str
    descricao: str
    tipo_icone: Optional[str] = None
    foto: Optional[str] = None

class RefeicaoCreate(RefeicaoBase):
    pass

class RefeicaoUpdate(BaseModel):
    horario: Optional[str] = None
    descricao: Optional[str] = None
    tipo_icone: Optional[str] = None
    foto: Optional[str] = None

class Refeicao(RefeicaoBase):
    id: str
    created_at: str
    
    class Config:
        orm_mode = True

# === Hidratação ===

class HidratacaoBase(BaseModel):
    user_id: str
    data: str
    quantidade_ml: int
    meta_diaria_ml: int
    ultimo_registro: Optional[str] = None

class HidratacaoCreate(HidratacaoBase):
    pass

class HidratacaoUpdate(BaseModel):
    quantidade_ml: Optional[int] = None
    meta_diaria_ml: Optional[int] = None
    ultimo_registro: Optional[str] = None

class Hidratacao(HidratacaoBase):
    id: str
    created_at: str
    
    class Config:
        orm_mode = True

# === Autoconhecimento ===

class NotaAutoconhecimentoBase(BaseModel):
    user_id: str
    categoria: str
    titulo: str
    conteudo: str

class NotaAutoconhecimentoCreate(NotaAutoconhecimentoBase):
    pass

class NotaAutoconhecimentoUpdate(BaseModel):
    titulo: Optional[str] = None
    conteudo: Optional[str] = None

class NotaAutoconhecimento(NotaAutoconhecimentoBase):
    id: str
    created_at: str
    updated_at: str
    
    class Config:
        orm_mode = True

# === Preferências do Usuário ===

class UserPreferencesBase(BaseModel):
    user_id: str
    alto_contraste: bool = False
    reducao_estimulos: bool = False
    texto_grande: bool = False
    modo_refugio: bool = False

class UserPreferencesCreate(UserPreferencesBase):
    pass

class UserPreferencesUpdate(BaseModel):
    alto_contraste: Optional[bool] = None
    reducao_estimulos: Optional[bool] = None
    texto_grande: Optional[bool] = None
    modo_refugio: Optional[bool] = None

class UserPreferences(UserPreferencesBase):
    id: str
    created_at: str
    updated_at: str
    
    class Config:
        orm_mode = True

# === Respostas padrão do Supabase ===

class SupabaseResponse(BaseModel):
    data: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None

# === Modelos para simulação de realtime ===

class RealtimeFilter(BaseModel):
    event: Optional[str] = '*'  # INSERT, UPDATE, DELETE ou *
    schema: str = 'public'
    table: str
    filter: Optional[str] = None

class ChannelRequest(BaseModel):
    channel: str

class SubscriptionRequest(BaseModel):
    channel: str
    filters: List[RealtimeFilter] 