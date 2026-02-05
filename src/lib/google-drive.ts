/* Google Drive API Utility - Handles loading scripts, authentication, and API calls */

const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
]
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly'

// These should be set in your .env file as VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''

let tokenClient: any
let gapiInited = false
let gisInited = false

export interface GDriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  thumbnailLink?: string
  durationMillis?: string
  parents?: string[]
  createdTime?: string
  modifiedTime?: string
}

// Helper to check if a script is already in the DOM
const isScriptLoaded = (src: string) => {
  return !!document.querySelector(`script[src="${src}"]`)
}

export const loadGoogleScripts = (
  onGapiLoaded: () => void,
  onGisLoaded: () => void,
) => {
  // GAPI Script
  const gapiSrc = 'https://apis.google.com/js/api.js'
  if (typeof window.gapi !== 'undefined') {
    onGapiLoaded()
  } else if (!isScriptLoaded(gapiSrc)) {
    const script1 = document.createElement('script')
    script1.src = gapiSrc
    script1.async = true
    script1.defer = true
    script1.onload = onGapiLoaded
    script1.onerror = () => console.error('Failed to load GAPI script')
    document.body.appendChild(script1)
  } else {
    // Script exists but might not be loaded yet, try to hook into onload if possible or wait
    // For simplicity, we assume if it exists it will trigger its onload or we rely on the caller to retry if needed
    // But to be safe for re-entry:
    const existingScript = document.querySelector(
      `script[src="${gapiSrc}"]`,
    ) as HTMLScriptElement
    if (existingScript) {
      const originalOnLoad = existingScript.onload
      existingScript.onload = (e) => {
        if (originalOnLoad) (originalOnLoad as any)(e)
        onGapiLoaded()
      }
      // If already loaded (readyState check not standard on all browsers for script tags), we might miss it
      // but window.gapi check handles the "already loaded" case.
    }
  }

  // GIS Script
  const gisSrc = 'https://accounts.google.com/gsi/client'
  if (typeof window.google?.accounts?.oauth2 !== 'undefined') {
    onGisLoaded()
  } else if (!isScriptLoaded(gisSrc)) {
    const script2 = document.createElement('script')
    script2.src = gisSrc
    script2.async = true
    script2.defer = true
    script2.onload = onGisLoaded
    script2.onerror = () => console.error('Failed to load GIS script')
    document.body.appendChild(script2)
  } else {
    const existingScript = document.querySelector(
      `script[src="${gisSrc}"]`,
    ) as HTMLScriptElement
    if (existingScript) {
      const originalOnLoad = existingScript.onload
      existingScript.onload = (e) => {
        if (originalOnLoad) (originalOnLoad as any)(e)
        onGisLoaded()
      }
    }
  }
}

export const initializeGapiClient = async () => {
  if (!API_KEY) {
    console.warn('VITE_GOOGLE_API_KEY is missing.')
    throw new Error('API Key is missing configuration')
  }

  if (typeof window.gapi === 'undefined') {
    throw new Error('Google API script not loaded')
  }

  // Explicitly load the client library before init
  await new Promise<void>((resolve, reject) => {
    window.gapi.load('client', {
      callback: resolve,
      onerror: reject,
      timeout: 10000, // 10s timeout
      ontimeout: () => reject(new Error('Timed out loading GAPI client')),
    })
  })

  // Verify client is available
  if (!window.gapi.client) {
    throw new Error('GAPI client failed to load')
  }

  try {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS,
    })
    gapiInited = true
  } catch (err: any) {
    console.error('GAPI Init Failed', err)
    throw new Error(
      err?.result?.error?.message || err.message || 'Failed to initialize GAPI',
    )
  }
}

export const initializeTokenClient = (callback: (response: any) => void) => {
  if (!CLIENT_ID) {
    console.warn('VITE_GOOGLE_CLIENT_ID is missing.')
    return
  }

  if (
    typeof window.google === 'undefined' ||
    !window.google.accounts ||
    !window.google.accounts.oauth2
  ) {
    throw new Error('Google Identity Services script not loaded')
  }

  try {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp: any) => {
        if (resp.error !== undefined) {
          throw resp
        }
        callback(resp)
      },
    })
    gisInited = true
  } catch (err) {
    console.error('GIS Init Error', err)
    throw err
  }
}

export const handleAuthClick = () => {
  if (!tokenClient) {
    console.error('Token client not initialized. Check Client ID.')
    return
  }
  tokenClient.requestAccessToken({ prompt: 'consent' })
}

export const handleSignOut = () => {
  if (window.gapi?.client) {
    const token = window.gapi.client.getToken()
    if (token !== null && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {})
      window.gapi.client.setToken(null)
    }
  }
}

export const listDriveFiles = async (
  folderId: string = 'root',
): Promise<GDriveFile[]> => {
  if (!gapiInited) throw new Error('Google Drive API not initialized')

  try {
    const response = await window.gapi.client.drive.files.list({
      pageSize: 50,
      fields:
        'nextPageToken, files(id, name, mimeType, size, thumbnailLink, videoMediaMetadata, parents, createdTime, modifiedTime)',
      q: `'${folderId}' in parents and (mimeType contains 'audio/' or mimeType = 'application/vnd.google-apps.folder') and trashed = false`,
      orderBy: 'folder, name',
    })
    return response.result.files as GDriveFile[]
  } catch (err) {
    console.error('Error listing files', err)
    throw err
  }
}

export const fetchDriveFileBlob = async (fileId: string): Promise<Blob> => {
  if (!gapiInited) throw new Error('Google Drive API not initialized')

  const token = window.gapi.client.getToken()?.access_token
  if (!token) throw new Error('No access token available')

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`)
  }

  return await response.blob()
}

// Recursive function to find all audio files in a folder tree
export const scanFolderForAudio = async (
  folderId: string,
): Promise<GDriveFile[]> => {
  if (!gapiInited) throw new Error('Google Drive API not initialized')

  const allAudio: GDriveFile[] = []

  // List all files in the current folder
  const response = await window.gapi.client.drive.files.list({
    pageSize: 100,
    fields:
      'files(id, name, mimeType, size, durationMillis, createdTime, modifiedTime)',
    q: `'${folderId}' in parents and (mimeType contains 'audio/' or mimeType = 'application/vnd.google-apps.folder') and trashed = false`,
  })

  const files = response.result.files as GDriveFile[]

  for (const file of files) {
    if (file.mimeType.includes('audio/')) {
      allAudio.push(file)
    } else if (file.mimeType === 'application/vnd.google-apps.folder') {
      // Recursively scan subfolders
      const subFiles = await scanFolderForAudio(file.id)
      allAudio.push(...subFiles)
    }
  }

  return allAudio
}
