
export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface UsuarioApi {
  id: string;
  empresa_id: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  avatar: string;
  requirePasswordChange: boolean;
  password?: string;
}

export interface LoginResponse {
  authenticated: boolean;
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioApi;
  message?: string;
  bloqueado?: boolean;
  fecha_desbloqueo: Date;
}
