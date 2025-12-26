import Nango from '@nangohq/frontend';

export interface NangoSessionOptions {
  userId: string;
  email: string;
  displayName: string;
  allowedIntegrations?: string[];
}

export interface NangoConnectionResult {
  success: boolean;
  connectionId?: string;
  integrationId?: string;
  error?: string;
}

/**
 * Get a Nango session token from the dolphin-integrations-v3 backend
 */
export async function getNangoSessionToken(
  options: NangoSessionOptions,
  dolphinIntegrationsUrl: string = 'http://localhost:3000'
): Promise<string> {
  const response = await fetch(`${dolphinIntegrationsUrl}/auth/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: options.userId,
      email: options.email,
      displayName: options.displayName,
      allowedIntegrations: options.allowedIntegrations || ['google'],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get Nango session token');
  }

  const data = await response.json();
  return data.sessionToken;
}

/**
 * Connect a user to Google via Nango
 * This will open the Nango Connect UI for Google authentication
 */
export async function connectGoogleWithNango(
  options: NangoSessionOptions,
  dolphinIntegrationsUrl?: string
): Promise<NangoConnectionResult> {
  try {
    // 1. Get session token from dolphin-integrations-v3
    const sessionToken = await getNangoSessionToken(options, dolphinIntegrationsUrl);

    // 2. Initialize Nango and open Connect UI
    const nango = new Nango();

    return new Promise((resolve) => {
      const connect = nango.openConnectUI({
        onEvent: (event) => {
          console.log('Nango event:', event);

          if (event.type === 'close') {
            resolve({
              success: false,
              error: 'User closed the connection dialog',
            });
          } else if (event.type === 'connect') {
            resolve({
              success: true,
              connectionId: event.connectionId,
              integrationId: event.integrationId,
            });
          } else if (event.type === 'error') {
            resolve({
              success: false,
              error: event.error || 'Connection failed',
            });
          }
        },
      });

      // 3. Set the session token
      connect.setSessionToken(sessionToken);
    });
  } catch (error) {
    console.error('Error connecting with Nango:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user's connections from dolphin-integrations-v3
 */
export async function getUserConnections(
  userId: string,
  dolphinIntegrationsUrl: string = 'http://localhost:3000'
) {
  const response = await fetch(
    `${dolphinIntegrationsUrl}/connections/user/${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get user connections');
  }

  return response.json();
}

/**
 * Delete a connection
 */
export async function deleteConnection(
  connectionId: string,
  dolphinIntegrationsUrl: string = 'http://localhost:3000'
) {
  const response = await fetch(
    `${dolphinIntegrationsUrl}/connections/${connectionId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete connection');
  }

  return response.json();
}
