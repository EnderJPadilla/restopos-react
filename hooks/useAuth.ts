// import { useContext } from "react";
// import { AuthContext } from "@/contexts/AuthContext";

// export function useAuth() {

//   const validarSesion = (async () => {
//     try {
//       const token = SessionService.getToken();
//       if (!token) {
//         return false;
//       }

//       const response = await apiFetch(
//         "/auth/validar-token",
//         {
//           method: "POST"
//         }
//       );
//       return response.success;

//     } catch {
//       return false;
//     }

//   }, []);

// };