const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  try {
    const token = localStorage.getItem( "accessToken" );
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization:
              `Bearer ${token}`,
          }),
          ...options.headers,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Error en la petición"
      );
    }

    return data;
  
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error instanceof Error
      ? error
      : new Error("Error desconocido en la petición");
  }

}