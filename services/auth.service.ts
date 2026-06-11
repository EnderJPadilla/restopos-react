import { apiFetch } from "./api";
import {
  LoginRequest,
  LoginResponse,
} from "@/models/auth.model";
import { User } from "@/models/usuario.model";


export const AuthService = {

  login(
    data: LoginRequest
  ) {

    return apiFetch<LoginResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  async validarToken(): Promise<User | null> {

    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        user: User;
      }>(
        "/auth/validar_token",
        {
          method: "POST"
        }
      );

      if (!response.success) {
        return null;
      }

      return response.user;

    } catch {
      return null;
    }

  }

};

