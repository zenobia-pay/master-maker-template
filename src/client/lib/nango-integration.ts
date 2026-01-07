import Nango from "@nangohq/frontend";
import type { ConnectUIEvent } from "@nangohq/frontend";

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * TODO: Update this URL to point to your integrations backend
 * This should be a service that provides Nango session tokens
 */
const INTEGRATIONS_API_URL = "https://integrations.dolphinmade.com";

/**
 * TODO: Add the integration IDs you want to support
 * These should match the provider config keys in your Nango account
 * Examples: "google", "slack", "github", "notion", "confluence", "salesforce"
 */
export type IntegrationId = string; // Replace with: "google" | "slack" | "github" | etc.

// =============================================================================
// TYPES
// =============================================================================

export interface NangoSessionOptions {
  userId: string;
  email: string;
  displayName: string;
  allowedIntegrations?: IntegrationId[];
}

export interface NangoConnectionResult {
  success: boolean;
  connectionId?: string;
  providerConfigKey?: string;
  error?: string;
}

export interface UserConnection {
  id: string;
  integrationId: IntegrationId;
  connectionId: string;
  createdAt: string;
  // TODO: Add additional fields based on your backend response
}

// =============================================================================
// CORE NANGO FUNCTIONS
// =============================================================================

/**
 * Get a Nango session token from your integrations backend
 */
export async function getNangoSessionToken(
  options: NangoSessionOptions
): Promise<string> {
  const response = await fetch(`${INTEGRATIONS_API_URL}/auth/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: options.userId,
      email: options.email,
      displayName: options.displayName,
      allowedIntegrations: options.allowedIntegrations,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get Nango session token");
  }

  const data: { sessionToken: string } = await response.json();
  return data.sessionToken;
}

/**
 * Generic function to connect a user to any integration via Nango
 * Opens the Nango Connect UI for the specified integration
 */
export async function connectWithNango(
  integrationId: IntegrationId,
  options: NangoSessionOptions
): Promise<NangoConnectionResult> {
  try {
    // 1. Get session token with the specific integration allowed
    const sessionToken = await getNangoSessionToken({
      ...options,
      allowedIntegrations: [integrationId],
    });

    // 2. Initialize Nango and open Connect UI
    const nango = new Nango();

    return new Promise((resolve) => {
      const connect = nango.openConnectUI({
        onEvent: (event: ConnectUIEvent) => {
          console.log(`Nango ${integrationId} event:`, event);

          if (event.type === "close") {
            resolve({
              success: false,
              error: "User closed the connection dialog",
            });
          } else if (event.type === "connect") {
            resolve({
              success: true,
              connectionId: event.payload.connectionId,
              providerConfigKey: event.payload.providerConfigKey,
            });
          } else if (event.type === "error") {
            resolve({
              success: false,
              error: event.payload.errorMessage || "Connection failed",
            });
          }
        },
      });

      // 3. Set the session token
      connect.setSessionToken(sessionToken);
    });
  } catch (error) {
    console.error(`Error connecting to ${integrationId} with Nango:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// CONNECTION MANAGEMENT
// =============================================================================

/**
 * Get all connections for a user from your integrations backend
 */
export async function getUserConnections(
  userId: string
): Promise<UserConnection[]> {
  const response = await fetch(
    `${INTEGRATIONS_API_URL}/connections/user/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get user connections");
  }

  return response.json();
}

/**
 * Delete a connection by ID
 */
export async function deleteConnection(connectionId: string): Promise<void> {
  const response = await fetch(
    `${INTEGRATIONS_API_URL}/connections/${connectionId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete connection");
  }
}

// =============================================================================
// INTEGRATION-SPECIFIC HELPERS (SCAFFOLD)
// =============================================================================

/**
 * TODO: Add integration-specific connect functions as needed
 *
 * Example for adding a Google integration:
 *
 * export async function connectGoogle(
 *   options: Omit<NangoSessionOptions, "allowedIntegrations">
 * ): Promise<NangoConnectionResult> {
 *   return connectWithNango("google", options);
 * }
 *
 * Example for adding a Slack integration:
 *
 * export async function connectSlack(
 *   options: Omit<NangoSessionOptions, "allowedIntegrations">
 * ): Promise<NangoConnectionResult> {
 *   return connectWithNango("slack", options);
 * }
 */
