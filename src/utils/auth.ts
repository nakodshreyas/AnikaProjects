export interface ClientSession {
  email: string;
  name: string;
  role: 'client' | 'admin';
  token: string;
  loginTime: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  session?: ClientSession;
}

export async function authenticateClient(
  identifier: string,
  secret: string
): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/client-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        identifier: identifier.trim(),
        password: secret,
      }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok || !data.success || !data.session) {
      return {
        success: false,
        message: data.message || 'Invalid email or password.',
      };
    }

    return {
      success: true,
      session: data.session,
    };
  } catch {
    return {
      success: false,
      message: 'Unable to connect to the server.',
    };
  }
}

export function logoutClient(): void {
  try {
    sessionStorage.removeItem(
      'anika_projects_client_session_v1'
    );
    localStorage.removeItem(
      'anika_projects_client_session_v1'
    );
  } catch {
    // Ignore storage errors.
  }
}
