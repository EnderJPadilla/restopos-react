import { apiFetch } from "./api";
import { ApiResponse } from "@/models/api-response.model";

export const UploadService = {

  async subirImagen(
    file: File,
    tipo: String
  ): Promise<string> {

    const token = localStorage.getItem(
      "accessToken"
    );

    const formData = new FormData();

    formData.append(
      "imagen",
      file
    );

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/upload/${tipo}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(
        data.message
      );
    }

    return data.data.url;

  }

};