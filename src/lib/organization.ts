export interface Organization {
  id: string
  name: string
  role: 'admin' | 'viewer' | 'editor'
}

// Mock organization data persistence
const STORAGE_KEY = 'harmonize_org_context'

export const getCurrentOrganization = (): Organization => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validate structure to ensure it's not partial/undefined
      if (parsed && parsed.id && parsed.name) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Failed to parse organization context', e)
  }

  // Default fallback to prevent undefined errors in components
  const defaultOrg: Organization = {
    id: 'default-org',
    name: 'Minha Loja',
    role: 'admin',
  }

  // Persist default if nothing exists or was invalid
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOrg))
  } catch (e) {
    console.error('Failed to save default organization context', e)
  }

  return defaultOrg
}

export const setOrganizationContext = (org: Organization) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(org))
  } catch (e) {
    console.error('Failed to save organization context', e)
  }
}
