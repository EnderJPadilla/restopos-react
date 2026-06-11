import { User } from "@/lib/types";

export const AuthStorage = {

  saveSession(
    user: User,
    accessToken: string,
    refreshToken: string
  ) {

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "accessToken",
      accessToken
    );

    localStorage.setItem(
      "refreshToken",
      refreshToken
    );
  },

  getUser(): User | null {
    const user = localStorage.getItem(
      "user"
    );

    return user
      ? JSON.parse(user)
      : null;
  },

  logout() {
    localStorage.clear();
  },
};