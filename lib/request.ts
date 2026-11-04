/** Every form gets a bounded request and a readable failure state. */
export async function requestJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data: unknown = await response.json().catch(() => null);
    const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : '';
    if (!response.ok) throw new Error(message || (response.status === 401 ? 'Votre connexion a expiré. Reconnectez-vous pour continuer.' : 'Le service est indisponible. Réessayez dans un instant.'));
    if (!data) throw new Error('La réponse du service est incomplète. Réessayez.');
    return data as T;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('La connexion prend trop de temps. Réessayez.');
    if (error instanceof TypeError) throw new Error('Connexion interrompue. Vérifiez votre réseau puis réessayez.');
    throw error;
  } finally { clearTimeout(timer); }
}
